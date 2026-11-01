import { buildPlan } from "@/lib/planner";
import { enrichPlan } from "@/lib/server/planning";
import { errorResponse, isRecord, readJsonBody } from "@/lib/server/http";
import { validateEventInput } from "@/lib/server/event-input";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  if (!isRecord(body.data)) return errorResponse("Send an event input.");
  const validated = validateEventInput(body.data.input);
  if (!validated.ok) return validated.response;
  const plan = buildPlan(validated.input);
  return Response.json(await enrichPlan(plan, request), {
    headers: { "Cache-Control": "no-store" },
  });
}
