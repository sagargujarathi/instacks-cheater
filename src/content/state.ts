import { IPromptDetails } from "@/types";

export let PROMPT_DETAILS: IPromptDetails = {
  isGenerated: false,
  isGenerating: false,
  questionNumber: -1,
  optionId: "",
  section: "",
};

export const resetPromptState = () => {
  PROMPT_DETAILS = {
    isGenerated: false,
    isGenerating: false,
    questionNumber: -1,
    optionId: "",
    section: "",
  };
};

export const setGenerating = (questionNumber: number, section: string) => {
  PROMPT_DETAILS = {
    isGenerated: false,
    isGenerating: true,
    questionNumber,
    optionId: "",
    section,
  };
};

export const setGenerated = (
  questionNumber: number,
  section: string,
  optionId: string
) => {
  PROMPT_DETAILS = {
    isGenerated: !!optionId,
    isGenerating: false,
    questionNumber,
    optionId,
    section,
  };
};
