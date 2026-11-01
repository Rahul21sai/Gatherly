import { z } from "zod";
import { boundedTextBody, isRecord } from "./http";
import { allowProviderRequest } from "./provider-limiter";

const NOT_CONFIGURED =
  "Live AI is not configured. This response uses the offline planner.";
const UNAVAILABLE =
  "Live AI is temporarily unavailable. This response uses the offline planner.";
const BUSY =
  "The live AI request limit has been reached. This response uses the offline planner.";

export function geminiConfiguration() {
  const key = process.env.GEMINI_API_KEY?.trim();
  const requestedModel = process.env.GEMINI_MODEL?.trim();
  const model =
    requestedModel && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(requestedModel)
      ? requestedModel
      : "gemini-2.5-flash";
  return { key, model };
}

export async function generateStructured<T>(
  request: Request,
  system: string,
  context: unknown,
  schema: z.ZodType<T>,
  outputTokens: number,
): Promise<{ ok: true; value: T } | { ok: false; warning: string }> {
  const { key, model } = geminiConfiguration();
  if (!key) return { ok: false, warning: NOT_CONFIGURED };
  if (!allowProviderRequest(request)) return { ok: false, warning: BUSY };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [
            { role: "user", parts: [{ text: JSON.stringify(context) }] },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(schema),
            maxOutputTokens: outputTokens,
            temperature: 0.6,
            ...(model.startsWith("gemini-2.5-flash")
              ? { thinkingConfig: { thinkingBudget: 0 } }
              : {}),
          },
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    if (!response.ok) return { ok: false, warning: UNAVAILABLE };
    const payload: unknown = JSON.parse(
      await boundedTextBody(response.body, 40000),
    );
    if (!isRecord(payload) || !Array.isArray(payload.candidates))
      return { ok: false, warning: UNAVAILABLE };
    const candidate: unknown = payload.candidates[0];
    if (
      !isRecord(candidate) ||
      !isRecord(candidate.content) ||
      !Array.isArray(candidate.content.parts)
    )
      return { ok: false, warning: UNAVAILABLE };
    const text = candidate.content.parts
      .flatMap((part: unknown) =>
        isRecord(part) && typeof part.text === "string" && !part.thought
          ? [part.text]
          : [],
      )
      .join("");
    if (!text.length || text.length > 14000)
      return { ok: false, warning: UNAVAILABLE };
    const result = schema.safeParse(JSON.parse(text));
    return result.success
      ? { ok: true, value: result.data }
      : { ok: false, warning: UNAVAILABLE };
  } catch {
    return { ok: false, warning: UNAVAILABLE };
  } finally {
    clearTimeout(timeout);
  }
}
