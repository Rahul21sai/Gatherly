import { buildPlan } from "@/lib/planner";
import {
  enrichPlan,
  errorResponse,
  readJsonBody,
  validateEventInput,
} from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (body.response) return body.response;
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data))
    return errorResponse("Send an event input.");
  const validated = validateEventInput(
    (body.data as Record<string, unknown>).input,
  );
  if (validated.response) return validated.response;
  const plan = buildPlan(validated.input!);
  return Response.json(await enrichPlan(plan, request), {
    headers: { "Cache-Control": "no-store" },
  });
}
