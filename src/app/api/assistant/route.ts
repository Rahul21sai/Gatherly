import {
  answerAssistant,
  errorResponse,
  readJsonBody,
  validateEventInput,
  validatedAssistantContext,
} from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request, 60000);
  if (body.response) return body.response;
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data))
    return errorResponse("Send an event, saved plan and message.");
  const data = body.data as Record<string, unknown>;
  const validated = validateEventInput(data.input);
  if (validated.response) return validated.response;
  if (
    typeof data.message !== "string" ||
    !data.message.trim() ||
    data.message.length > 2000
  ) {
    return errorResponse("Enter a message between 1 and 2,000 characters.");
  }
  const context = validatedAssistantContext(data.plan, validated.input!);
  if (context.response) return context.response;
  return Response.json(
    await answerAssistant(
      validated.input!,
      context.plan!,
      data.message.trim(),
      request,
    ),
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
