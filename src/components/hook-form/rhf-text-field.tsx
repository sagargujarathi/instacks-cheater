import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ErrorComponent from "./error-component";

// ----------------------------------------------------------------------

export type RHFTextFieldProps = {
  name: string;
  label?: string;
  helperText?: React.ReactNode;
  type?: string;
  placeholder?: string;
  className?: string;
};

export function RHFTextField({
  name,
  label,
  helperText,
  type = "text",
  placeholder,
  className,
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();
  const fieldRef = useRef<HTMLInputElement>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          {label && (
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
            </label>
          )}
          <input
            {...field}
            ref={fieldRef}
            id={name}
            type={type}
            placeholder={placeholder}
            value={type === "number" && field.value === 0 ? "" : field.value}
            onChange={(event) => {
              if (type === "number") {
                field.onChange(Number(event.target.value));
              } else {
                field.onChange(event.target.value);
              }
            }}
            className={`input-field ${error ? "border-error-main" : ""}`}
            {...other}
          />
          {(!!error || helperText) && (
            <div className="mt-1">
              {error ? <ErrorComponent message={error?.message} /> : helperText}
            </div>
          )}
        </div>
      )}
    />
  );
}
