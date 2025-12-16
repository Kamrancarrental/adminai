
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_MODEL } from '../constants';

// This is a placeholder for the API key. In a real environment, it would be configured.
// For local development, ensure process.env.API_KEY is set via your build tool or environment.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY is not set. Gemini API service will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'YOUR_GEMINI_API_KEY_HERE' }); // Fallback for development if env is not set

export const geminiService = {
  generateText: async (userPrompt: string, systemInstruction?: string): Promise<string | undefined> => {
    if (!apiKey) {
      return `[MOCK AI DRAFT] No API_KEY configured. This is a simulated draft response for: "${userPrompt.substring(0, 100)}..."`;
    }

    try {
      const config: {
        temperature: number;
        topP: number;
        topK: number;
        maxOutputTokens: number;
        thinkingConfig: { thinkingBudget: number };
        systemInstruction?: string;
      } = {
        temperature: 0.5, // Set temperature to 0.5 as requested
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 250, // Limit output token to keep replies concise
        thinkingConfig: { thinkingBudget: 100 },
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await ai.models.generateContent({
        model: GEMINI_API_MODEL,
        contents: [{ text: userPrompt }], // User's specific prompt
        config: config,
      });

      const text = response.text;
      return text;
    } catch (error) {
      console.error('Error generating text with Gemini API:', error);
      throw new Error('Failed to generate AI draft from Gemini.');
    }
  },

  // You can add more Gemini-related functions here, e.g., for chat streaming,
  // image analysis (if integrated directly into frontend for visual products), etc.
};
