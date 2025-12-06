
import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult, ChartDataPoint } from '../types';
import { SYSTEM_INSTRUCTION, ANALYSIS_PROMPT_TEMPLATE } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface AnalysisResponse {
  assessment: ChartDataPoint[];
  theme: string;
  visualDescription: string;
  vibeCheck: string;
  deepDive: string[];
  realityCheck: string;
  healingRoadmap: string[];
}

// Helper to clean markdown symbols (*, #, -) from text
const cleanText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '') // Remove bold **
    .replace(/#/g, '')    // Remove headers #
    .replace(/^\s*-\s*/gm, '') // Remove list hyphens at start of lines
    .replace(/`/g, '')    // Remove code ticks
    .trim();
};

const extractJson = (text: string): AnalysisResponse | null => {
  const jsonRegex = /```json\n([\s\S]*?)\n```|({[\s\S]*})/;
  const match = text.match(jsonRegex);
  if (!match) return null;
  
  const jsonString = match[1] || match[2];
  try {
    const parsed = JSON.parse(jsonString);
    // Basic validation
    if (parsed.assessment && parsed.theme && Array.isArray(parsed.assessment)) {
      return {
          assessment: parsed.assessment.map((item: any) => ({
              name: cleanText(item.name || 'Unknown'),
              percentage: item.percentage || 0
          })),
          theme: cleanText(parsed.theme || 'Journey'),
          visualDescription: cleanText(parsed.visualDescription || "A visual representation of your inner world."),
          vibeCheck: cleanText(parsed.vibeCheck || "You're doing great."),
          deepDive: Array.isArray(parsed.deepDive) ? parsed.deepDive.map(cleanText) : ["Exploring your shadow..."],
          realityCheck: cleanText(parsed.realityCheck || "Stay true to yourself."),
          healingRoadmap: Array.isArray(parsed.healingRoadmap) ? parsed.healingRoadmap.map(cleanText) : ["Take a deep breath."]
      };
    }
    return null;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return null;
  }
};


export const getAnalysisAndImage = async (answers: string[]): Promise<AnalysisResult> => {
  try {
    const analysisModel = 'gemini-2.5-pro';
    const imageModel = 'gemini-2.5-flash-image';
    
    const analysisPrompt = ANALYSIS_PROMPT_TEMPLATE(answers);

    const result = await ai.models.generateContent({
      model: analysisModel,
      contents: analysisPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    const responseText = result.text;
    const jsonPart = extractJson(responseText);

    if (!jsonPart) {
      throw new Error("Failed to extract valid JSON analysis from the response.");
    }

    // Generate Image - Updated prompt for "Tidy, Life Path, High Quality, Related"
    const imagePrompt = `A high-end, minimalist, and tidy digital art piece representing a life path journey with the theme: '${jsonPart.theme}'.
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

    let imageUrl = '';
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64ImageBytes}`;
      }
    }

    if (!imageUrl) {
        throw new Error("Failed to generate image.");
    }
    
    return {
      chartData: jsonPart.assessment,
      imageUrl: imageUrl,
      visualDescription: jsonPart.visualDescription,
      theme: jsonPart.theme,
      vibeCheck: jsonPart.vibeCheck,
      deepDive: jsonPart.deepDive,
      realityCheck: jsonPart.realityCheck,
      healingRoadmap: jsonPart.healingRoadmap
    };

  } catch (error) {
    console.error("Error in Gemini service:", error);
    throw new Error("Could not get analysis from AI.");
  }
};
