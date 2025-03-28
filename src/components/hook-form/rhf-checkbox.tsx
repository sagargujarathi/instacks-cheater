import { Controller, useFormContext } from "react-hook-form";
import ErrorComponent from "./error-component";

export interface RHFCheckboxProps {
  name: string;
  label?: React.ReactNode;
  color?: string;
  helperText?: React.ReactNode;
  className?: string;
}

export function RHFCheckbox({
  name,
  helperText,
  label,
  color,
  className,
  ...other
}: RHFCheckboxProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={`mb-4 ${className || ""}`}>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              {...field}
              checked={field.value}
              className="mt-0.5 h-4 w-4 text-indigo-500 rounded border-gray-300 focus:ring-indigo-400"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>

          {(!!error || helperText) && (
            <div className="mt-1 ml-6">
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
