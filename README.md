# Instacks Cheater Extension

Browser extension built with React + TypeScript + Vite that assists with exam interface interaction and AI answer generation.

## Architecture Overview

```
src/
  content/            Content script logic
    index.ts          Entry point & listeners
    state.ts          Central prompt state (immutable replace pattern)
    dom.ts            DOM extraction helpers (question metadata, option inputs)
    notify.ts         Toast utility
  services/
    gemini-api.ts     Gemini provider implementation (IAIProvider)
    openai-api.ts     OpenAI provider implementation (IAIProvider)
    ai-service.ts     Provider factory + validation
    ai-types.ts       Provider interface definitions
    answer-utils.ts   Shared answer extraction
  helpers/            High-level orchestration (generateAnswer, exam data)
  pages/              Popup & terms UI
  constants/          Keys, options and defaults
  types/              Strong TypeScript models
```

## AI Provider Abstraction

Both Gemini and OpenAI implement `IAIProvider` with a single method:

```ts
interface IAIProvider {
  generateAnswer(question: Question): Promise<string>;
}
```

The factory (`ai-service.ts`) loads the chosen provider and API key from `chrome.storage.local`, supports dynamic key refresh, and exposes structured validation metadata for Gemini.

## Answer Extraction

`answer-utils.ts` applies strict regex patterns and guards against error text to prevent false positives. Only returns `option_#` if a clean single-letter answer is detected.

## Content Script Modularization

Large imperative logic was split into focused modules:

- `state.ts` manages prompt state transitions (`setGenerating`, `setGenerated`, `resetPromptState`).
- `dom.ts` isolates DOM queries (making it easier to adapt to layout changes).
- `notify.ts` provides a lightweight toast system.
- `index.ts` now coordinates extraction, generation, selection, and event wiring.

## Validation & Feedback

Popup performs provider validation and displays model metadata (token limits, version) for Gemini. OpenAI shows basic model info.

## Development Commands

```bash
bun install
bun run build   # Build extension
bun dev         # Dev server for popup UI (if configured)
```

Load the `dist` (or project root if using manifest in place) into Chrome via `chrome://extensions` (Developer Mode → Load unpacked).

## Best Practices Implemented

- Strong typing replacing `any` where feasible.
- Provider interface for future expansion (Anthropic, etc.).
- Centralized state & side-effects minimal in content entry file.
- Defensive regex & error filtering to avoid random selections.
- Dynamic key refresh ensures latest user key is used.

## Future Improvements

- Model selection dropdown for Gemini/OpenAI.
- Retry/backoff strategy with exponential delay on transient errors.
- Telemetry (optional) for success/failure of generations (respecting privacy).
- Unit tests for `answer-utils.ts` and provider factories.

## Disclaimer

Use responsibly and in compliance with all applicable rules and laws.
