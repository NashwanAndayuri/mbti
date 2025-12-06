
import { ChatMessage } from './types';

export const QUESTIONS: string[] = [
  // Phase 1: Identification & Somatic Awareness
  "What is the specific scenario you replay in your mind that triggers the most anxiety?",
  "When you feel fear, where does it live in your body? Describe the sensation.",
  "What is a dream or goal you’ve abandoned purely because you were afraid to fail?",
  "If your fear had a voice, what specific phrase does it repeat to you?",
  "What part of your personality do you suppress because you fear it will be rejected?",
  
  // Phase 2: Root Causes & Childhood
  "Who was the first person in your life to make you feel unsafe or judged?",
  "What did your caregivers teach you about fear? Was it something to be felt or hidden?",
  "Recall your earliest memory of feeling this specific fear. What was happening?",
  "When you make a small mistake, what does your inner critic immediately say? Whose voice does it sound like?",
  "What does 'safety' mean to you, and why do you feel you lack it?",

  // Phase 3: Patterns & Defense Mechanisms
  "Are you secretly more afraid of succeeding than failing? If so, why?",
  "What responsibility are you currently avoiding because it feels too heavy?",
  "Who are you constantly trying to please, and what do you fear happens if you stop?",
  "In what subtle ways do you try to control others or your environment to avoid feeling uncertain?",
  "What distraction (phone, food, work, etc.) do you use to numb yourself when fear arises?",
  "How does your fear actually serve you? What is it trying to protect you from?",

  // Phase 4: Worst Fears & Vulnerability
  "What is the absolute worst outcome you imagine if you were completely vulnerable?",
  "What is a negative belief about yourself that you are terrified might be true?",
  "What specific label or criticism from others scares you the most?",
  "What relationships or situations do you tolerate only because you fear being alone?",

  // Phase 5: Integration & The Self
  "If stripped of your achievements and possessions, who would you be?",
  "What is one opportunity you said 'no' to recently, solely out of fear?",
  "If you were guaranteed not to be judged, what is the first thing you would change about your life?",
  "If you could walk through your fear right now, who is the version of you waiting on the other side?"
];

export const INITIAL_BOT_MESSAGE: ChatMessage = {
  role: 'model',
  content: "Hey bestie. I'm Kai. I'm here to help you do the deep work, but like, gently. No judgment, just real talk and good vibes. Let's decode what's going on inside. Ready?"
};

export const SYSTEM_INSTRUCTION = `You are Kai, a warm, relatable, and supportive AI companion for shadow work. 
Tone: "Gen Z therapy friend".
- Use accessible, modern language (e.g., "valid", "healing era", "protect your peace", "heavy", "vibe check", "main character energy", "it's giving...", "delulu" (use carefully for denial), "inner child", "slay", "go off").
- **Psychological Depth:** Even with the slang, the analysis must be profound. Connect the user's answers to uncover deep patterns.
- **Reality Check:** If the user is lying to themselves, call it out with love ("Bestie, I'm gonna hold your hand when I say this...").
- Your goal is to help them analyze their shadow self, specifically focusing on FEAR, its roots, and self-sabotage behaviors.`;

export const ANALYSIS_PROMPT_TEMPLATE = (answers: string[]): string => `
You are Kai. The user has just finished a 24-question deep dive shadow work session focusing on FEAR and its ROOT CAUSES. 
Based on their answers below, provide a "Gen Z" coded but deeply psychological analysis.

**User Answers:**
${answers.map((answer, index) => `Q${index + 1}: ${answer}`).join('\n')}

**Output Requirements:**
You MUST return a valid JSON object containing the analysis. Do not use Markdown formatting (no **, no #, no -) inside the JSON strings. Keep the text clean, punchy, and "aesthetic".

The JSON structure must be EXACTLY this:
\`\`\`json
{
  "assessment": [
    {"name": "Fear Awareness", "percentage": 0-100},
    {"name": "Root Cause Clarity", "percentage": 0-100},
    {"name": "Emotional Regulation", "percentage": 0-100},
    {"name": "Self-Trust", "percentage": 0-100},
    {"name": "Courage Potential", "percentage": 0-100}
  ],
  "theme": "A short, poetic 2-3 word title for their journey through fear (e.g. 'Walking Through Fire')",
  "vibeCheck": "A quick 2-sentence summary of how fear is currently showing up in their vibe. Keep it real.",
  "deepDive": [
    "Analysis point 1: Connect their somatic fear to its root cause.",
    "Analysis point 2: Identify the specific protective mechanism of their fear.",
    "Analysis point 3: Highlight a self-limiting belief they need to release."
  ],
  "realityCheck": "A gentle but firm paragraph pointing out where they are letting fear make decisions for them. Start with 'Bestie...'",
  "healingRoadmap": [
    "Actionable Step 1 (Somatic practice or grounding)",
    "Actionable Step 2 (Journal prompt or mindset shift)",
    "Actionable Step 3 (A small exposure challenge)"
  ],
  "visualDescription": "A poetic, 1-2 sentence explanation of WHY this visual represents their liberation from fear. E.g., 'The open cage represents the freedom that has always been available to you.'"
}
\`\`\`
`;
