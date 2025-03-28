import { z } from "zod";
import { AUTO_SELECT_KEY_OPTIONS, GENERATE_KEY_OPTIONS } from "@/constants";

// Extract values for validation
const generateKeyValues = GENERATE_KEY_OPTIONS.map((option) => option.value);
const autoSelectKeyValues = AUTO_SELECT_KEY_OPTIONS.map(
  (option) => option.value
);

// Create schema
const schema = z.object({
  generateKey: z.enum(generateKeyValues as [string, ...string[]]),
  autoSelectKey: z.enum(autoSelectKeyValues as [string, ...string[]]),
  secretKey: z
    .string()
    .min(1, "API key is required")
    .regex(/^AIza[0-9A-Za-z-_]{35}$/, "Invalid Gemini API key format")
    .or(z.literal("")), // Allow empty string to use default
  termsAndConditions: z.literal(true, {
    errorMap: () => ({ message: "You must accept terms and conditions" }),
  }),
});

export type FormType = z.infer<typeof schema>;

export default schema;
