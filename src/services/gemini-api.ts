import axios from "axios";
import { KEY_TYPES } from "@/constants";

// Gemini API configuration
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "models/gemini-pro";

// HTML tag stripping function
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

interface GeminiPromptOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate text response from Gemini API
   */
  async generateText(prompt: string, options: GeminiPromptOptions = {}) {
    try {
      const response = await axios.post(
        `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 1024,
          },
        }
      );

      if (response.status === 200 && response.data?.candidates?.length > 0) {
        return response.data.candidates[0]?.content?.parts[0]?.text || "";
      } else {
        console.error("Error generating text:", response.statusText);
        return "Error generating answer";
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      return "Failed to generate answer";
    }
  }

  /**
   * Generate answer for a specific question
   */
  async generateAnswer(question: any) {
    // Prepare question text and options
    let questionText = question.question || "";
    // Strip HTML tags if present
    questionText = stripHtml(questionText);

    const options = [];

    for (let i = 1; i <= 5; i++) {
      const optionKey = `option_${i}`;
      if (question[optionKey]) {
        // Strip HTML tags from options too
        const optionText = stripHtml(question[optionKey]);
        options.push(`${String.fromCharCode(64 + i)}. ${optionText}`);
      }
    }

    // Build the prompt for the API
    const prompt = `
    I need you to solve this multiple-choice question accurately.
    Analyze the question carefully and select the correct answer.
    
    Question: ${questionText}
    
    Options:
    ${options.join("\n")}
    
    Answer with ONLY the letter of the correct option (A, B, C, D, or E).
    `;

    const answer = await this.generateText(prompt, {
      temperature: 0.3, // Lower temperature for more deterministic answers
      maxOutputTokens: 50, // Keep it brief
    });

    // Extract the option letter from the response
    const optionLetter = answer.match(/^[A-E]/i)?.[0];

    if (optionLetter) {
      const optionIndex = optionLetter.toUpperCase().charCodeAt(0) - 64;
      return `option_${optionIndex}`;
    }

    return "";
  }
}

// Singleton instance
let geminiInstance: GeminiService | null = null;

export const initializeGeminiApi = async (): Promise<GeminiService> => {
  // Get API key from storage or use the provided default key
  const result = await chrome.storage.local.get([KEY_TYPES.SECRET_KEY]);
  const apiKey =
    result[KEY_TYPES.SECRET_KEY] || "AIzaSyBEk3Igyw-mcaJ8GdW5oEdQZqeGotNckGA";

  geminiInstance = new GeminiService(apiKey);
  return geminiInstance;
};

export const getGeminiApi = (): GeminiService => {
  if (!geminiInstance) {
    geminiInstance = new GeminiService(
      "AIzaSyBEk3Igyw-mcaJ8GdW5oEdQZqeGotNckGA"
    );
  }
  return geminiInstance;
};

export default GeminiService;
