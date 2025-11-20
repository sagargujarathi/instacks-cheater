import {} from "@/types";
import type { Question } from "@/types";

export interface IAIProvider {
  generateAnswer(question: Question): Promise<string>;
}

export type AIProviderName = "GEMINI" | "OPENAI";
