import { inputSchema } from "@/lib/validation";
import type { EventInput } from "@/lib/types";
import {
  errorResponse,
  INPUT_LIMIT,
  jsonByteSize,
  type ValidationResult,
} from "./http";

export function validateEventInput(
  value: unknown,
): ValidationResult<{ input: EventInput }> {
  if (jsonByteSize(value) > INPUT_LIMIT)
    return {
      ok: false,
      response: errorResponse("The event input is too large.", 413),
    };
  const parsed = inputSchema.safeParse(value);
  if (!parsed.success)
    return {
      ok: false,
      response: errorResponse("Check the event fields and try again."),
    };
  return { ok: true, input: parsed.data };
}
