import { geminiConfiguration } from "@/lib/server/gemini-transport";

export const runtime = "nodejs";

export function GET() {
  const { key, model } = geminiConfiguration();
  return Response.json(
    { configured: Boolean(key), provider: "Gemini", ...(key ? { model } : {}) },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
