import axios from "axios";
import { KEY_TYPES } from "@/constants";

interface GeminiPromptOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

// Gemini API configuration
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "models/gemini-2.0-flash"; // This model supports multimodal inputs

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

class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

      const response = await axios.post(
        `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 1024,
          },
        }
      );

      if (response.status === 200 && response.data?.candidates?.length > 0) {
        const result =
          response.data.candidates[0]?.content?.parts[0]?.text || "";
        console.log("Gemini API response received successfully");
        return result;
      } else {
        console.error("Error generating response:", response.statusText);
        return "Error generating answer";
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      return "Failed to generate answer";
    }
  }

  /**
   * Generate answer for a specific question, processing images if present
   */
  async generateAnswer(question: any) {
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

    // Make prompt even more concise to save tokens
    const prompt = `${questionText}

${options.join("\n")}

Answer with letter only (A-E).`;

    console.log("Prompt for Gemini API:", prompt);

    // Use multimodal generation only if images exist
    const answer =
      images.length > 0
        ? await this.generateMultimodalResponse(prompt, images, {
            temperature: 0.3,
            maxOutputTokens: 100,
          })
        : await this.generateMultimodalResponse(prompt, [], {
            temperature: 0.3,
            maxOutputTokens: 100,
          });

    console.log("Raw answer from Gemini:", answer);

    // Extract option letter using the same logic
    let optionLetter;

    // Try different patterns to extract the answer
    const patterns = [
      /^([A-E])/i, // Just the letter at the beginning
      /The answer is ([A-E])/i, // "The answer is X" format
      /\b([A-E])[.\s)]/i, // Letter followed by period, space or parenthesis
      /[^a-zA-Z]([A-E])[^a-zA-Z]/i, // Letter surrounded by non-alphabetic chars
      /[A-E]/i, // Any letter A-E anywhere
    ];

    for (const pattern of patterns) {
      const match = answer.match(pattern);
      if (match) {
        optionLetter = match[1] || match[0];
        break;
      }
    }

    console.log("Extracted option letter:", optionLetter);

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
