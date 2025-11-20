interface QuestionMetadata {
  number: number;
  section: string;
  text: string;
}

export const extractQuestionMetadata = (): QuestionMetadata | null => {
  try {
    const heading = document.querySelector(
      ".question-heading h6.font-weight-bold"
    );
    const headingText = heading?.textContent || "";
    const number = Number(headingText.match(/Ques\s+(\d+)\s*\//)?.[1] || "0");
    const sectionEl = document.querySelector(".sidebar-brand-2 h6:last-child");
    const section = sectionEl?.textContent?.trim() || "";
    return { number, section, text: headingText };
  } catch (e) {
    console.error("[DOM] Failed to extract question metadata", e);
    return null;
  }
};

export const selectOptionInputs = (optionValue: string): HTMLInputElement[] => {
  const value = optionValue.replace('"', "");
  const el = document.querySelector(
    `input[value=${value}]`
  ) as HTMLInputElement | null;
  return el ? [el] : [];
};

export type { QuestionMetadata };
