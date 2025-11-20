import axios from "axios";
import extractOption from "@/services/answer-utils";
import { KEY_TYPES } from "@/constants";
import type { Question } from "@/types";
import { IAIProvider } from "@/services/ai-types";

interface GeminiPromptOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

// Gemini API configuration
export const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";
export const GEMINI_PRIMARY_MODELS = [
  "models/gemini-1.5-pro",
  "models/gemini-2.0-flash",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-flash-latest",
];

// HTML tag stripping function
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

/**
 * Convert an image URL to base64 string for API consumption
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    // If it's already a data URL, return it directly
    if (url.startsWith("data:image")) {
      return url;
    }

    // For network URLs, fetch and convert to base64
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
}

class GeminiService implements IAIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public updateApiKey(key: string) {
    this.apiKey = key;
  }

  public getApiKey() {
    return this.apiKey;
  }

  /**
   * Generate text response from Gemini API with optional image inputs
   */
  async generateMultimodalResponse(
    prompt: string,
    images: string[] = [],
    options: GeminiPromptOptions = {}
  ) {
    try {
      // Refresh API key from storage if changed
      try {
        const stored = await chrome.storage.local.get([KEY_TYPES.SECRET_KEY]);
        const storedKey = stored[KEY_TYPES.SECRET_KEY];
        if (storedKey && storedKey !== this.apiKey) {
          console.log("GeminiService: updating API key from storage");
          this.apiKey = storedKey;
        }
      } catch (e) {
        console.warn("GeminiService: could not refresh API key", e);
      }

      console.log("Preparing multimodal request with", images.length, "images");

      // Prepare parts array with text and images
      const parts: any[] = [{ text: prompt }];

      // Add image parts if any
      for (const imageUrl of images) {
        const base64Image = await imageUrlToBase64(imageUrl);
        if (base64Image) {
          // Get mime type from the data URL
          const mimeType = base64Image.split(";")[0].split(":")[1];
          // Get base64 data without the prefix
          const base64Data = base64Image.split(",")[1];

          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }

      console.log("Sending multimodal request to Gemini API");

      const payload = {
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
        },
      };

      console.log(
        "GeminiService: using API key prefix:",
        this.apiKey ? this.apiKey.slice(0, 8) + "***" : "<none>"
      );

      let lastError: any = null;
      for (const model of GEMINI_PRIMARY_MODELS) {
        try {
          const response = await axios.post(
            `${GEMINI_BASE_URL}/${model}:generateContent?key=${this.apiKey}`,
            payload
          );
          if (
            response.status === 200 &&
            response.data?.candidates?.length > 0
          ) {
            const result =
              response.data.candidates[0]?.content?.parts[0]?.text || "";
            console.log("Gemini model succeeded:", model);
            return result;
          }
          console.warn("Model returned no candidates:", model);
        } catch (err: any) {
          lastError = err;
          const status = err.response?.status;
          const data = err.response?.data;
          console.warn(
            "Model failed",
            model,
            status,
            data?.error?.message || data
          );
          // If 401 or 403 stop early (auth issue won't fix by switching models)
          if (status === 401 || status === 403) {
            return `Auth error (${status}) - check API key / quota`;
          }
          // If invalid model, continue loop
          continue;
        }
      }
      return (
        lastError?.response?.data?.error?.message || "Error generating answer"
      );
    } catch (error) {
      if (error.response) {
        console.error("Gemini API error status", error.response.status);
        console.error("Gemini API error body", error.response.data);
        return (
          error.response.data?.error?.message || "Failed to generate answer"
        );
      } else {
        console.error("Gemini API network/unknown error", error);
      }
      return "Failed to generate answer";
    }
  }

  /**
   * Generate answer for a specific question, processing images if present
   */
  async generateAnswer(question: Question) {
    // Prepare question text and options
    let questionText = question.question || "";
    // Strip HTML tags if present
    questionText = stripHtml(questionText);

    // Prepare images collection
    const images: string[] = [];

    // Add question image if present
    if (question.question_image) {
      images.push(question.question_image);
    }

    const options = [];

    for (let i = 1; i <= 5; i++) {
      const optionKey = `option_${i}`;
      const optionImageKey = `option_${i}_image`;

      if (question[optionKey]) {
        // Strip HTML tags from options too
        const optionText = stripHtml(question[optionKey]);
        options.push(`${String.fromCharCode(64 + i)}. ${optionText}`);

        // Add option image if present
        if (question[optionImageKey]) {
          images.push(question[optionImageKey]);
        }
      }
    }

    // Create a detailed prompt that encourages reasoning
    const prompt = `You are an expert test-taker answering a multiple-choice question. Your goal is to select the single CORRECT answer.

Question:
${questionText}

Options:
${options.join("\n")}

Think through this step-by-step:
1. Read and understand what the question is asking
2. Eliminate obviously wrong answers
3. Compare remaining options carefully
4. Select the most accurate answer

Respond with ONLY the letter (A, B, C, D, or E). No explanation needed.

Correct answer:`;

    console.log("Prompt for Gemini API:", prompt);

    // Use multimodal generation with zero temperature for maximum accuracy
    const answer =
      images.length > 0
        ? await this.generateMultimodalResponse(prompt, images, {
            temperature: 0,
            maxOutputTokens: 200,
          })
        : await this.generateMultimodalResponse(prompt, [], {
            temperature: 0,
            maxOutputTokens: 200,
          });

    console.log("Raw answer from Gemini:", answer);
    return extractOption(answer);
  }
}

// Singleton instance
let geminiInstance: GeminiService | null = null;

export const initializeGeminiApi = async (): Promise<GeminiService> => {
  // Get API key from storage or use the provided default key
  const result = await chrome.storage.local.get([KEY_TYPES.SECRET_KEY]);
  const apiKey =
    result[KEY_TYPES.SECRET_KEY] || "AIzaSyBEk3Igyw-mcaJ8GdW5oEdQZqeGotNckGA"; // Use provided default key

  geminiInstance = new GeminiService(apiKey);
  return geminiInstance;
};

export const getGeminiApi = (): GeminiService => {
  if (!geminiInstance) {
    geminiInstance = new GeminiService(
      "AIzaSyBEk3Igyw-mcaJ8GdW5oEdQZqeGotNckGA" // Use provided default key
    );
  }
  return geminiInstance;
};

export default GeminiService;

// Lightweight key validation: attempt to fetch model metadata
export interface GeminiValidationResult {
  valid: boolean;
  model?: string;
  version?: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTemperature?: number;
  error?: string;
}

export const validateGeminiKey = async (
  apiKey: string
): Promise<GeminiValidationResult> => {
  if (!apiKey)
    return { valid: false, error: "Missing API key. Provide a Gemini key." };
  // Try model metadata first for each candidate model
  for (const model of GEMINI_PRIMARY_MODELS) {
    try {
      const resp = await axios.get(`${GEMINI_BASE_URL}/${model}?key=${apiKey}`);
      if (resp.status === 200 && resp.data) {
        return { valid: true, model, ...resp.data };
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        return {
          valid: false,
          error: `Auth error (${status}). Check key permissions or quota.`,
        };
      }
      // Continue on 404/400; try next model
      continue;
    }
  }
  return { valid: false, error: "No accessible Gemini model found." };
};
