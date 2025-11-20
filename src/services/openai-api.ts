import axios from "axios";
import extractOption from "@/services/answer-utils";
import type { Question } from "@/types";
import { IAIProvider } from "@/services/ai-types";

interface OpenAIPromptOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o";

const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

class OpenAIService implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_OPENAI_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private buildPrompt(question: Question) {
    let questionText = stripHtml(question.question || "");
    const options: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const optionKey = `option_${i}`;
      if (question[optionKey]) {
        const optionText = stripHtml(question[optionKey]);
        options.push(`${String.fromCharCode(64 + i)}. ${optionText}`);
      }
    }
    return `You are an expert test-taker answering a multiple-choice question. Your goal is to select the single CORRECT answer.

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
  }

  async generateAnswer(question: Question, options: OpenAIPromptOptions = {}) {
    try {
      const prompt = this.buildPrompt(question);
      const response = await axios.post(
        `${OPENAI_BASE_URL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: options.temperature ?? 0,
          max_tokens: options.maxTokens ?? 200,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const answer = response.data?.choices?.[0]?.message?.content || "";
      return extractOption(answer);
    } catch (error) {
      console.error("OpenAI API error", error);
      return "";
    }
  }
}

export default OpenAIService;
