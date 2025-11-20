import { z } from "zod";
import {
  AUTO_SELECT_KEY_OPTIONS,
  GENERATE_KEY_OPTIONS,
  AI_PROVIDER_OPTIONS,
} from "@/constants";

// Extract values for validation
const generateKeyValues = GENERATE_KEY_OPTIONS.map((option) => option.value);
const autoSelectKeyValues = AUTO_SELECT_KEY_OPTIONS.map(
  (option) => option.value
);

// Create schema
const providerValues = AI_PROVIDER_OPTIONS.map((o) => o.value);

const schema = z.object({
  generateKey: z.enum(generateKeyValues as [string, ...string[]]),
  autoSelectKey: z.enum(autoSelectKeyValues as [string, ...string[]]),
  provider: z.enum(providerValues as [string, ...string[]]),
  secretKey: z
    .string()
    .optional() // provider may supply default
    .transform((val) => (val === undefined ? "" : val)),
  termsAndConditions: z.literal(true, {
    errorMap: () => ({ message: "You must accept terms and conditions" }),
  }),
});

export type FormType = z.infer<typeof schema>;

export default schema;
