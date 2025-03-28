import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import schema, { FormType } from "@/pages/pop-up/schema";
import {
  AUTO_SELECT_KEY_OPTIONS,
  GENERATE_KEY_OPTIONS,
  KEY_TYPES,
} from "@/constants";
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

  const methods = useForm({
    defaultValues: {
      generateKey: "E",
      autoSelectKey: "D",
      secretKey: "AIzaSyBEk3Igyw-mcaJ8GdW5oEdQZqeGotNckGA", // Default Gemini API key
      termsAndConditions: false,
    },
    resolver: zodResolver(schema),
    reValidateMode: "onChange",
    mode: "all",
  });

  const onSubmit = (form: FormType) => {
    chrome.storage.local.set(
      {
        [KEY_TYPES.GENERATE_KEY]: form.generateKey,
        [KEY_TYPES.AUTO_SELECT_KEY]: form.autoSelectKey,
        [KEY_TYPES.SECRET_KEY]: form.secretKey,
      },
      () => console.log("CONFIGURATION SET SUCCESSFULLY")
    );
    setStatus(STATUS_TYPE.PASSED);
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Gemini API Key
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
                  placeholder="Using default API key"
                  helperText="Default key is already provided"
                />
              </div>

              {status !== STATUS_TYPE.NOT_VERIFIED && (
                <div
                  className={
                    status === STATUS_TYPE.PASSED
                      ? "status-success"
                      : "status-error"
                  }
                >
                  <div className="flex items-center gap-2">
                    {status === STATUS_TYPE.PASSED ? (
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
                        <span>All set to go! Please reload the page</span>
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
                        <span>Invalid configuration</span>
                      </>
                    )}
                  </div>
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
                  !methods.formState.isValid || status === STATUS_TYPE.PASSED
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  !methods.formState.isValid || status === STATUS_TYPE.PASSED
                }
              >
                {status === STATUS_TYPE.PASSED
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
