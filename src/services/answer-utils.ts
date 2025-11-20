// Shared utility for extracting an option letter (A-E) from model output

// Only match clear answer formats; avoid accidental matches in error messages
const patterns: RegExp[] = [
  /^\s*([A-E])\s*$/i, // single letter
  /^\s*([A-E])[.)\s]*$/i, // letter with trailing punctuation/spaces
  /^The answer is ([A-E])\b/i,
  /^Answer:?\s*([A-E])\b/i,
  /^Option:?\s*([A-E])\b/i,
];

export const extractOption = (raw: string): string => {
  if (!raw) return "";
  const text = raw.trim();
  // Reject obvious error responses
  if (/error|failed|auth|quota|denied|invalid/i.test(text)) return "";
  // Consider only first line to reduce noise
  const firstLine = text.split(/\r?\n/)[0];
  for (const pattern of patterns) {
    const match = firstLine.match(pattern);
    if (match) {
      const optionLetter = match[1].toUpperCase();
      const optionIndex = optionLetter.charCodeAt(0) - 64;
      if (optionIndex >= 1 && optionIndex <= 5) {
        return `option_${optionIndex}`;
      }
    }
  }
  return "";
};

export default extractOption;
