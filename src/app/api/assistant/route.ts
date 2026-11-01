import { answerAssistant } from "@/lib/server/planning";
import { errorResponse, isRecord, readJsonBody } from "@/lib/server/http";
import { validateEventInput } from "@/lib/server/event-input";
import { validatedAssistantContext } from "@/lib/server/assistant-context";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request, 60000);
  if (!body.ok) return body.response;
  if (!isRecord(body.data))
    return errorResponse("Send an event, saved plan and message.");
  const data = body.data;
  const validated = validateEventInput(data.input);
  if (!validated.ok) return validated.response;
  if (
    typeof data.message !== "string" ||
    !data.message.trim() ||
    data.message.length > 2000
  ) {
    return errorResponse("Enter a message between 1 and 2,000 characters.");
  }
  const context = validatedAssistantContext(data.plan, validated.input);
  if (!context.ok) return context.response;
  return Response.json(
    await answerAssistant(
      validated.input,
      context.plan,
      data.message.trim(),
      request,
    ),
    { headers: { "Cache-Control": "no-store" } },
  );
}
