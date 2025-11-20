import { KEY_TYPES, DEFAULT_GEMINI_KEY } from "@/constants";
import GeminiService, {
  getGeminiApi,
  initializeGeminiApi,
  validateGeminiKey,
  GeminiValidationResult,
} from "@/services/gemini-api";
import OpenAIService from "@/services/openai-api";
import axios from "axios";

export type ProviderType = "GEMINI" | "OPENAI";

let serviceInstance: any = null;
let currentProvider: ProviderType | null = null;

export const initializeAIService = async (): Promise<any> => {
  const result = await chrome.storage.local.get([
    KEY_TYPES.SECRET_KEY,
    KEY_TYPES.AI_PROVIDER,
  ]);
  const provider: ProviderType =
    (result[KEY_TYPES.AI_PROVIDER] as ProviderType) || "GEMINI";
  const secretKey: string =
    result[KEY_TYPES.SECRET_KEY] ||
    (provider === "GEMINI" ? DEFAULT_GEMINI_KEY : "");

  console.log("[AI Service] Initializing provider:", provider);
  console.log(
    "[AI Service] API key prefix:",
    secretKey ? secretKey.slice(0, 10) + "***" : "<none>"
  );

  if (provider === "OPENAI") {
    serviceInstance = new OpenAIService(secretKey);
    console.log("[AI Service] OpenAI service initialized");
  } else {
    // Gemini
    try {
      serviceInstance = getGeminiApi();
    } catch {
      serviceInstance = await initializeGeminiApi();
    }
    console.log("[AI Service] Gemini service initialized");
  }
  currentProvider = provider;
  return serviceInstance;
};

export const refreshAIService = async (): Promise<void> => {
  const result = await chrome.storage.local.get([
    KEY_TYPES.SECRET_KEY,
    KEY_TYPES.AI_PROVIDER,
  ]);
  const provider: ProviderType =
    (result[KEY_TYPES.AI_PROVIDER] as ProviderType) ||
    currentProvider ||
    "GEMINI";
  const secretKey: string =
    result[KEY_TYPES.SECRET_KEY] ||
    (provider === "GEMINI" ? DEFAULT_GEMINI_KEY : "");

  console.log(
    "[AI Service] Refreshing - Current provider:",
    currentProvider,
    "New provider:",
    provider
  );
  console.log(
    "[AI Service] API key prefix:",
    secretKey ? secretKey.slice(0, 10) + "***" : "<none>"
  );

  // If provider changed or key changed, rebuild instance
  if (provider !== currentProvider) {
    console.log("[AI Service] Provider changed, rebuilding service instance");
    serviceInstance = null;
  }
  if (provider === "GEMINI") {
    if (!serviceInstance) {
      serviceInstance = new GeminiService(secretKey);
      console.log("[AI Service] Created new Gemini service");
    } else if (serviceInstance && serviceInstance.updateApiKey) {
      serviceInstance.updateApiKey(secretKey);
      console.log("[AI Service] Updated Gemini API key");
    }
  } else if (provider === "OPENAI") {
    if (!serviceInstance) {
      serviceInstance = new OpenAIService(secretKey);
      console.log("[AI Service] Created new OpenAI service");
    } else if (serviceInstance && serviceInstance.apiKey !== secretKey) {
      serviceInstance = new OpenAIService(secretKey);
      console.log("[AI Service] Recreated OpenAI service with new key");
    }
  }
  currentProvider = provider;
};

export const getAIService = (): any => {
  if (!serviceInstance) {
    throw new Error("AI Service not initialized");
  }
  return serviceInstance;
};

export const getCurrentProvider = (): ProviderType | null => currentProvider;

export interface ProviderValidationResult {
  valid: boolean;
  details?: Record<string, any>;
  error?: string;
}

// Validate API key for a given provider. Returns structured result.
export const validateProviderKey = async (
  provider: ProviderType,
  apiKey: string
): Promise<ProviderValidationResult> => {
  if (provider === "GEMINI") {
    const result: GeminiValidationResult = await validateGeminiKey(apiKey);
    return {
      valid: result.valid,
      details: result.valid ? result : undefined,
      error: result.error,
    };
  }
  if (provider === "OPENAI") {
    if (!apiKey) return { valid: false, error: "Missing API key." };
    try {
      const response = await axios.get(
        `https://api.openai.com/v1/models/gpt-4o-mini`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      if (response.status === 200) {
        return {
          valid: true,
          details: response.data,
        };
      }
      return { valid: false, error: `Unexpected status ${response.status}` };
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        return { valid: false, error: `Auth error (${status}).` };
      }
      return {
        valid: false,
        error:
          err?.response?.data?.error?.message || "OpenAI validation failed",
      };
    }
  }
  return { valid: false, error: "Unsupported provider" };
};
