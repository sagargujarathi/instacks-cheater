import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import schema, { FormType } from "@/pages/pop-up/schema";
import {
  AUTO_SELECT_KEY_OPTIONS,
  GENERATE_KEY_OPTIONS,
  AI_PROVIDER_OPTIONS,
  KEY_TYPES,
  DEFAULT_GEMINI_KEY,
} from "@/constants";
import {
  validateProviderKey,
  ProviderValidationResult,
} from "@/services/ai-service";
import FormProvider from "@/components/hook-form/form-provider";
import { RHFAutocomplete } from "@/components/hook-form/rhf-autocomplete";
import { RHFCheckbox } from "@/components/hook-form/rhf-checkbox";
import { RHFTextField } from "@/components/hook-form/rhf-text-field";
import TermsAndConditions from "../terms-and-conditions";

const enum STATUS_TYPE {
  NOT_VERIFIED = "NOT_VERIFIED",
  PASSED = "PASSED",
  FAILED = "FAILED",
}

function Popup() {
  const [status, setStatus] = useState(STATUS_TYPE.NOT_VERIFIED);
  const [isTACPage, setIsTACPage] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [providerDetails, setProviderDetails] = useState<Record<
    string,
    any
  > | null>(null);

  const methods = useForm<FormType>({
    defaultValues: {
      generateKey: "E",
      autoSelectKey: "D",
      provider: "GEMINI",
      secretKey: DEFAULT_GEMINI_KEY,
      termsAndConditions: false,
    },
    resolver: zodResolver(schema),
    reValidateMode: "onChange",
    mode: "all",
  });

  const onSubmit = async (form: FormType) => {
    setIsValidating(true);
    setValidationMessage("");
    setStatus(STATUS_TYPE.NOT_VERIFIED);

    chrome.storage.local.set(
      {
        [KEY_TYPES.GENERATE_KEY]: form.generateKey,
        [KEY_TYPES.AUTO_SELECT_KEY]: form.autoSelectKey,
        [KEY_TYPES.SECRET_KEY]: form.secretKey || DEFAULT_GEMINI_KEY,
        [KEY_TYPES.AI_PROVIDER]: form.provider,
      },
      async () => {
        try {
          const keyToTest = form.secretKey || DEFAULT_GEMINI_KEY;
          const result: ProviderValidationResult = await validateProviderKey(
            form.provider as any,
            keyToTest
          );
          if (result.valid) {
            setStatus(STATUS_TYPE.PASSED);
            setProviderDetails(result.details || null);
            setValidationMessage(
              form.provider === "GEMINI"
                ? `Validated: ${result.details?.displayName || result.details?.model || "Gemini model"} | Input tokens: ${result.details?.inputTokenLimit ?? "-"} | Output tokens: ${result.details?.outputTokenLimit ?? "-"}`
                : "API key validated successfully."
            );
          } else {
            setStatus(STATUS_TYPE.FAILED);
            setProviderDetails(null);
            setValidationMessage(
              result.error || "API key invalid or not authorized."
            );
          }
        } catch (e) {
          setStatus(STATUS_TYPE.FAILED);
          setValidationMessage("Validation failed. Please retry.");
          setProviderDetails(null);
        } finally {
          setIsValidating(false);
        }
      }
    );
  };

  return (
    <div className="min-h-[300px] bg-gray-50">
      <FormProvider methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
        {isTACPage ? (
          <TermsAndConditions onClick={() => setIsTACPage((x) => !x)} />
        ) : (
          <div className="bg-white shadow overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 text-white p-5">
              <h1 className="text-xl font-bold text-center">
                INSTACKS CHEATER
              </h1>
            </div>

            <div className="p-6 space-y-4">
              <RHFAutocomplete
                size="medium"
                name="generateKey"
                label="Generate Key"
                options={GENERATE_KEY_OPTIONS}
                helperText="Press this key to generate answers"
              />

              <RHFAutocomplete
                size="medium"
                name="autoSelectKey"
                label="Auto Select Key"
                options={AUTO_SELECT_KEY_OPTIONS}
                helperText="Press this key to auto-select correct answers"
              />

              <RHFAutocomplete
                size="medium"
                name="provider"
                label="AI Provider"
                options={AI_PROVIDER_OPTIONS}
                helperText="Choose which AI model to use"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {methods.watch("provider") === "OPENAI"
                      ? "OpenAI API Key"
                      : "Gemini API Key"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>

                <RHFTextField
                  name="secretKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder={
                    methods.watch("provider") === "GEMINI"
                      ? "Using default Gemini key"
                      : "Enter provider key"
                  }
                  helperText={
                    methods.watch("provider") === "GEMINI"
                      ? "Default key is already provided"
                      : "Required for OpenAI"
                  }
                />
              </div>

              {(status !== STATUS_TYPE.NOT_VERIFIED || isValidating) && (
                <div
                  className={
                    isValidating
                      ? "status-info"
                      : status === STATUS_TYPE.PASSED
                        ? "status-success"
                        : "status-error"
                  }
                >
                  <div className="flex items-center gap-2">
                    {isValidating ? (
                      <>
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="4"
                            d="M4 12a8 8 0 018-8"
                          ></path>
                        </svg>
                        <span>Validating API key...</span>
                      </>
                    ) : status === STATUS_TYPE.PASSED ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{validationMessage || "All set to go!"}</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          {validationMessage || "Invalid configuration"}
                        </span>
                      </>
                    )}
                  </div>
                  {status === STATUS_TYPE.PASSED && providerDetails && (
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      {methods.watch("provider") === "GEMINI" && (
                        <>
                          {providerDetails.displayName && (
                            <div>
                              <span className="font-semibold">Model:</span>{" "}
                              {providerDetails.displayName} (
                              {providerDetails.version})
                            </div>
                          )}
                          {providerDetails.inputTokenLimit && (
                            <div>
                              <span className="font-semibold">
                                Input Limit:
                              </span>{" "}
                              {providerDetails.inputTokenLimit.toLocaleString()}
                            </div>
                          )}
                          {providerDetails.outputTokenLimit && (
                            <div>
                              <span className="font-semibold">
                                Output Limit:
                              </span>{" "}
                              {providerDetails.outputTokenLimit.toLocaleString()}
                            </div>
                          )}
                          {providerDetails.supportedGenerationMethods && (
                            <div>
                              <span className="font-semibold">Methods:</span>{" "}
                              {providerDetails.supportedGenerationMethods.join(
                                ", "
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {methods.watch("provider") === "OPENAI" &&
                        providerDetails.id && (
                          <div>
                            <span className="font-semibold">Model:</span>{" "}
                            {providerDetails.id}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              <RHFCheckbox
                name="termsAndConditions"
                label={
                  <>
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setIsTACPage((x) => !x)}
                      className="text-indigo-500 underline hover:text-indigo-700"
                    >
                      Terms and Conditions
                    </button>
                  </>
                }
              />

              <button
                type="submit"
                className={`btn-primary w-full mt-2 ${
                  !methods.formState.isValid || isValidating
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!methods.formState.isValid || isValidating}
              >
                {isValidating
                  ? "Validating..."
                  : status === STATUS_TYPE.PASSED
                    ? "Configured"
                    : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </FormProvider>
    </div>
  );
}

export default Popup;
