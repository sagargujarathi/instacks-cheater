export const enum KEY_TYPES {
  SECRET_KEY = "SECRET_KEY",
  GENERATE_KEY = "GENERATE_KEY",
  AUTO_SELECT_KEY = "AUTO_SELECT_KEY",
  AI_PROVIDER = "AI_PROVIDER",
}

// Removed unused INSTACKS_GET_EXAM_DETAILS_API constant (was never referenced)

export const GENERATE_KEY_OPTIONS = [
  { label: "E", value: "E" },
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  { label: "Q", value: "Q" },
  { label: "A", value: "A" },
  { label: "Z", value: "Z" },
  { label: "T", value: "T" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
];

export const AUTO_SELECT_KEY_OPTIONS = [
  { label: "D", value: "D" },
  { label: "F", value: "F" },
  { label: "S", value: "S" },
  { label: "X", value: "X" },
  { label: "C", value: "C" },
  { label: "V", value: "V" },
  { label: "W", value: "W" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
];

export const AI_PROVIDER_OPTIONS = [
  { label: "Gemini", value: "GEMINI" },
  { label: "OpenAI", value: "OPENAI" },
];

export const DEFAULT_GEMINI_KEY = "AIzaSyBEk3Igyw-mcaJ8GdW5oEdQZqeGotNckGA"; // existing default
