import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ErrorComponent from "./error-component";

export interface RHFAutocompleteProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  options: Array<{ label: string; value: string } | string>;
  shouldDirty?: boolean;
  size?: "small" | "medium";
  className?: string;
}

export function RHFAutocomplete({
  name,
  label,
  placeholder,
  helperText,
  options,
  shouldDirty = false,
  size = "medium",
  className,
  ...other
}: RHFAutocompleteProps) {
  const { control, setValue } = useFormContext();
  const fieldRef = useRef<HTMLSelectElement>(null);

  // Convert string array to object array if needed
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={`form-control ${className || ""}`}>
          {label && (
            <label htmlFor={name} className="form-label">
              {label}
            </label>
          )}
          <div className="relative">
            <select
              {...field}
              id={name}
              ref={fieldRef}
              className={`select-field ${size === "small" ? "py-1.5 text-sm" : "py-2"} ${
                error ? "border-red-500" : ""
              }`}
              onChange={(e) => {
                setValue(name, e.target.value, {
                  shouldValidate: true,
                  shouldDirty,
                });
              }}
              {...other}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {normalizedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          {(!!error || helperText) && (
            <div className="mt-1">
              {error ? (
                <ErrorComponent message={error?.message} />
              ) : (
                <div className="text-xs text-gray-500">{helperText}</div>
              )}
            </div>
          )}
        </div>
      )}
    />
  );
}
