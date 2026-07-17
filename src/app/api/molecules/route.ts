import { NextResponse } from "next/server";
import { searchMolecule } from "@/lib/pubchem";
import { moleculesSchema, parseJsonBody } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`molecules:${getClientIp(request)}`, 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const parsed = await parseJsonBody(request, moleculesSchema);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await searchMolecule(parsed.data.query, parsed.data.type);
    if (!result) {
      return NextResponse.json({ error: "Keine Ergebnisse gefunden" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Molecule search error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
