import { KEY_TYPES } from "@/constants";
import { extractDataFromUrl, generateAnswer, getExamDetails } from "@/helpers";
import {
  PROMPT_DETAILS,
  setGenerating,
  setGenerated,
  resetPromptState,
} from "@/content/state";

interface QuestionMetadata {
  number: number;
  section: string;
  text: string;
}

const extractQuestionData = (): QuestionMetadata | null => {
  try {
    // Extract question number from heading (format: "Ques 1 / 25:")
    const questionHeading = document.querySelector(
      ".question-heading h6.font-weight-bold"
    );
    const questionHeadingText = questionHeading?.textContent || "";
    console.log("Question heading text:", questionHeadingText);

    // Extract just the number with more specific regex
    const questionNumber = Number(
      questionHeadingText.match(/Ques\s+(\d+)\s*\//)?.[1] || "0"
    );

    // Extract section name - second h6 element with section name
    // Format is usually: first h6 has "Section", second h6 has the actual name like "Part-A Verbal Ability"
    const sectionEl = document.querySelector(".sidebar-brand-2 h6:last-child");
    let section = sectionEl?.textContent?.trim() || "";

    console.log("Extracted question number:", questionNumber);
    console.log("Extracted section name:", section);

    return {
      number: questionNumber,
      section,
      text: questionHeadingText,
    };
  } catch (error) {
    console.error("Error extracting question data:", error);
    return null;
  }
};

// Content script minimal logging prefix
const log = (...args: any[]) => console.log("[Content]", ...args);
const handleGenerateAnswer = async (
  questionData: QuestionMetadata,
  examData: any
) => {
  console.log("Generating answer for question:", questionData.number);
  // Return if already generating or generated for this question
  if (
    PROMPT_DETAILS.isGenerating ||
    (PROMPT_DETAILS.isGenerated &&
      PROMPT_DETAILS.questionNumber === questionData.number)
  ) {
    console.log("Skipping generation - already processing or completed");
    return;
  }

  // Set generating state
  setGenerating(questionData.number, questionData.section);
  log("State generating", PROMPT_DETAILS);
  const sectionData = examData.find(
    (item: any) => item.model_name === questionData.section
  );
  const question = sectionData?.questions?.[questionData.number - 1];
  console.log("EXAM DATA:", examData);
  console.log("SECTION DATA:", sectionData);
  console.log("QUESTION DATA:", question);

  if (!question) {
    console.error("Question data not found in exam data");
    setGenerated(questionData.number, questionData.section, "");
    return;
  }

  console.log("Calling Gemini API for answer...");
  const option = await generateAnswer(question);
  console.log("Received answer from AI provider:", option || "<none>");

  if (!option) {
    // Provide a non-intrusive notification only once per question
    const note = document.createElement("div");
    note.style.cssText =
      "position:fixed;bottom:10px;right:10px;background:#f59e0b;color:#fff;padding:8px 12px;font-size:12px;border-radius:4px;z-index:9999;";
    note.textContent = "AI could not determine an answer for this question.";
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2500);
  }

  // Update state with generated result
  setGenerated(questionData.number, questionData.section, option || "");
  log("State generated", PROMPT_DETAILS);
};

const handleAutoSelect = (questionData: QuestionMetadata) => {
  console.log("Auto-selecting answer");
  if (
    PROMPT_DETAILS.questionNumber === questionData.number &&
    PROMPT_DETAILS.isGenerated &&
    PROMPT_DETAILS.optionId
  ) {
    PROMPT_DETAILS.optionId.split(", ").forEach((item) => {
      const input = document.querySelector(
        `input[value=${item.replace('"', "")}]`
      ) as HTMLInputElement;

      if (input) {
        console.log("Clicking option:", item);
        input.click();
      } else {
        console.error("Could not find input element for option:", item);
      }
    });
  }
};

const handleKeyPress = async (
  event: KeyboardEvent,
  config: any,
  examData: any
) => {
  const key = event.key.toUpperCase();
  console.log("Key pressed:", key);
  const questionData = extractQuestionData();

  if (!questionData) {
    console.error("No question data found on page");
    return;
  }

  console.log("Question data:", questionData);
  console.log("Current config:", config);

  // Return if already processing this question
  if (PROMPT_DETAILS.questionNumber === questionData.number) {
    if (PROMPT_DETAILS.isGenerating) {
      console.log("Skipping - answer is currently being generated");
      return;
    }
    if (PROMPT_DETAILS.isGenerated && key === config[KEY_TYPES.GENERATE_KEY]) {
      console.log("Skipping - answer already generated for this question");
      return;
    }
  }

  if (key === config[KEY_TYPES.GENERATE_KEY]) {
    console.log("Generate key pressed, initiating answer generation");
    await handleGenerateAnswer(questionData, examData);
  } else if (
    key === config[KEY_TYPES.AUTO_SELECT_KEY] &&
    PROMPT_DETAILS.isGenerated &&
    PROMPT_DETAILS.optionId &&
    PROMPT_DETAILS.questionNumber === questionData.number
  ) {
    console.log("Auto-select key pressed, selecting answer");
    handleAutoSelect(questionData);
  }
};

// Store the current keypress handler to allow cleanup
let currentKeypressHandler: ((event: KeyboardEvent) => void) | null = null;

const loadScripts = async () => {
  console.log("Loading scripts...");
  const { BASE_URL, ATTEMPT_ID } = extractDataFromUrl();
  console.log("URL data extracted:", { BASE_URL, ATTEMPT_ID });

  const CONFIGURATION_DATA = await chrome.storage.local.get([
    KEY_TYPES.GENERATE_KEY,
    KEY_TYPES.AUTO_SELECT_KEY,
  ]);
  console.log("Configuration loaded:", CONFIGURATION_DATA);

  const EXAM_DATA = await getExamDetails(BASE_URL, ATTEMPT_ID);
  console.log("Exam data loaded:", EXAM_DATA ? "Success" : "Failed");
  console.log("EXAM_DATA:", EXAM_DATA);

  // Dump sample of exam data for debugging
  if (EXAM_DATA && EXAM_DATA.length > 0) {
    console.log("First section name:", EXAM_DATA[0]?.name);
    console.log(
      "First question sample:",
      EXAM_DATA[0]?.questions?.[0]?.question?.substring(0, 50)
    );
  }

  // CHECK IF WE GOT DATA
  if (!ATTEMPT_ID) {
    console.error("Missing attempt ID");
    return;
  }

  if (!EXAM_DATA) {
    console.error("Failed to get exam data");
    // Show a small notification to the user
    const notifyElement = document.createElement("div");
    notifyElement.style.cssText =
      "position:fixed;bottom:10px;right:10px;background:red;color:white;padding:10px;z-index:9999;border-radius:5px;";
    notifyElement.textContent =
      "Failed to load exam data. Press generate key again.";
    document.body.appendChild(notifyElement);
    setTimeout(() => notifyElement.remove(), 3000);
    return;
  }

  // Remove old keypress listener if it exists
  if (currentKeypressHandler) {
    window.removeEventListener("keypress", currentKeypressHandler);
    console.log("Removed old keypress listener");
  }

  // Create and store new keypress handler
  currentKeypressHandler = (event: KeyboardEvent) =>
    handleKeyPress(event, CONFIGURATION_DATA, EXAM_DATA);

  console.log("Setting up keypress listener");
  window.addEventListener("keypress", currentKeypressHandler);
  console.log("Scripts loaded successfully");
};

const initListeners = () => {
  console.log("Initializing listeners...");

  const documentBody = document.body;

  documentBody.onselectstart = null;
  document.onselectstart = null;

  documentBody.oncopy = null;
  documentBody.oncut = null;

  documentBody.onpaste = null;

  document.oncontextmenu = null;
  documentBody.oncontextmenu = null;

  document.onkeydown = null;
  documentBody.onkeydown = null;

  document.onkeyup = null;
  documentBody.onkeyup = null;

  window.onfocus = null;
  document.onfocus = null;

  window.onblur = null;
  document.onblur = null;

  document.onvisibilitychange = null;

  window.onpagehide = null;
  window.onpageshow = null;

  // Attempt to remove security scripts
  try {
    const securityScripts = document.querySelector(
      `script[src="${"https://demo.proctoring.online/sdk/supervisor.js"}"]`
    ) as HTMLScriptElement;
    if (securityScripts) securityScripts.remove();

    const playerScripts = document.querySelector(
      `script[src="${"https://player.vimeo.com/api/player.js"}"]`
    ) as HTMLScriptElement;
    if (playerScripts) playerScripts.remove();

    const scripts = document.querySelector(
      `script[src="${"polyfills-es2015.aa74eb7c80e33db4c40e.js"}"]`
    ) as HTMLScriptElement;
    if (scripts) scripts.remove();
  } catch (e) {
    console.warn("Error removing scripts:", e);
  }

  // Call loadScripts to set up event handlers
  loadScripts();
};

// Track URL changes and initialization state
let PREVIOUS_HREF = window.location.href;
let isInitializing = false;

// Run initialization immediately when script loads
console.log("Content script loaded, initializing...");
initListeners();

// Also set up monitoring for URL changes
setInterval(() => {
  if (window.location.href === PREVIOUS_HREF) return;
  if (isInitializing) {
    console.log("Already initializing, skipping...");
    return;
  }

  console.log("URL changed from", PREVIOUS_HREF, "to", window.location.href);
  PREVIOUS_HREF = window.location.href;

  // Reset state when URL changes
  resetPromptState();

  isInitializing = true;
  initListeners();
  // Reset flag after a short delay to allow initialization to complete
  setTimeout(() => {
    isInitializing = false;
  }, 1000);
}, 500);

// DEVELOPED BY SAGAR GUJARATHI :D
// READ THE TERMS AND CONDITIONS BEFORE USING THIS EXTENSION
