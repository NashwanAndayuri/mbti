import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AnalysisResult, ChartDataPoint } from '../types';
import { SYSTEM_INSTRUCTION, ANALYSIS_PROMPT_TEMPLATE } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Schema ensures the AI returns exactly this structure, preventing parsing errors
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    assessment: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
        },
        required: ["name", "percentage"],
      },
    },
    theme: { type: Type.STRING },
    visualDescription: { type: Type.STRING },
    vibeCheck: { type: Type.STRING },
    deepDive: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    realityCheck: { type: Type.STRING },
    healingRoadmap: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["assessment", "theme", "visualDescription", "vibeCheck", "deepDive", "realityCheck", "healingRoadmap"],
};

// A fallback abstract gradient image (Base64 SVG) to use when image generation quota is exceeded
const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQzMzhjYTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2ZDI4ZDk7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMjQiIGhlaWdodD0iMTAyNCIgZmlsbD0idXJsKCNncmFkKSIgLz48ZyBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjUxMiIgY3k9IjUxMiIgcj0iMzAwIiBmaWxsPSJ3aGl0ZSIvPjwvZz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjUiPihWaXN1YWxpemF0aW9uIFVuYXZhaWxhYmxlKQ0KPC90ZXh0Pjwvc3ZnPg==";

/**
 * Generates the visual anchor image based on the theme.
 * Can be called independently for retries.
 */
export const generateVisualAnchor = async (theme: string): Promise<string> => {
  const imageModel = 'gemini-2.5-flash-image';
  const imagePrompt = `A high-end, minimalist, and tidy digital art piece representing a life path journey with the theme: '${theme}'.
    Style: Serene, clean composition, ethereal lighting, soft cinematic atmosphere.
    Visuals: A clear path or road leading towards a gentle light, uncluttered environment, symbolic of healing and growth. 
    Colors: Soothing pastels, deep calming blues or warm golds. 
    No text, no chaotic elements. Perfectionist composition.`;

  const imageResponse = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [{ text: imagePrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of imageResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }
  
  throw new Error("No image data returned from API");
};

export const getAnalysisAndImage = async (answers: string[]): Promise<AnalysisResult> => {
  const analysisPrompt = ANALYSIS_PROMPT_TEMPLATE(answers);
  let analysisData: any = null;

  // 1. Try with the powerful model (gemini-3-pro-preview)
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: analysisPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      }
    });
    
    if (result.text) {
      analysisData = JSON.parse(result.text);
    }
  } catch (error) {
    console.warn("Primary model failed (likely quota), failing over to Flash model...", error);
  }

  // 2. Fallback to Flash model if primary failed (Handles 429 Quota Exceeded)
  if (!analysisData) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: analysisPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
        }
      });

      if (result.text) {
        analysisData = JSON.parse(result.text);
      }
    } catch (error) {
      console.error("Fallback model also failed:", error);
      throw new Error("Service is currently overloaded. Please try again in a few moments.");
    }
  }

  if (!analysisData) {
     throw new Error("Failed to generate analysis data.");
  }

  // 3. Generate Image (With graceful failure and retry flag)
  let imageUrl = FALLBACK_IMAGE;
  let isImageFallback = true;
  
  try {
    imageUrl = await generateVisualAnchor(analysisData.theme);
    isImageFallback = false;
  } catch (error) {
      // Log the error but DO NOT throw it. Proceed with the fallback image.
      console.warn("Image generation failed (Quota exceeded or other error). Using fallback image.", error);
      isImageFallback = true;
  }

  return {
    chartData: analysisData.assessment,
    imageUrl: imageUrl,
    visualDescription: analysisData.visualDescription,
    theme: analysisData.theme,
    vibeCheck: analysisData.vibeCheck,
    deepDive: analysisData.deepDive,
    realityCheck: analysisData.realityCheck,
    healingRoadmap: analysisData.healingRoadmap,
    isImageFallback: isImageFallback
  };
};
