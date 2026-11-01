export const INPUT_LIMIT = 24000;
const encoder = new TextEncoder();

export type ValidationResult<T> =
  ({ ok: true } & T) | { ok: false; response: Response };

type BodyResult = ValidationResult<{ data: unknown }>;

export function errorResponse(message: string, status = 400) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function boundedTextBody(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
) {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let result = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return result + decoder.decode();
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RangeError("Body exceeds the allowed size");
      }
      result += decoder.decode(chunk.value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export async function readJsonBody(
  request: Request,
  maxBytes = INPUT_LIMIT,
): Promise<BodyResult> {
  const declaredSize = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
    return {
      ok: false,
      response: errorResponse("The request is too large.", 413),
    };
  }
  try {
    const data: unknown = JSON.parse(
      await boundedTextBody(request.body, maxBytes),
    );
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      response:
        error instanceof RangeError
          ? errorResponse("The request is too large.", 413)
          : errorResponse("Send a valid JSON request."),
    };
  }
}

export function jsonByteSize(value: unknown) {
  return encoder.encode(JSON.stringify(value) ?? "").byteLength;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
