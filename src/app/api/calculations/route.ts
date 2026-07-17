import { NextResponse } from "next/server";
import {
  calculateMolarMass,
  calculateConcentration,
  calculatePH,
  calculateStoichiometry,
  calculateDilution,
} from "@/lib/chemistry";
import { calculationsSchema, parseJsonBody } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`calculations:${getClientIp(request)}`, 60, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const parsed = await parseJsonBody(request, calculationsSchema);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const body = parsed.data;

    let result: unknown;
    switch (body.type) {
      case "molar_mass":
        result = calculateMolarMass(body.params.formula);
        if (!result) return NextResponse.json({ error: "Ungültige Formel" }, { status: 400 });
        break;
      case "concentration":
        result = calculateConcentration(body.params.moles, body.params.volume);
        break;
      case "ph":
        result = calculatePH(
          body.params.concentration,
          body.params.acidBaseType,
          body.params.ka
        );
        break;
      case "stoichiometry":
        result = calculateStoichiometry(
          body.params.reactantMass,
          body.params.reactantMolarMass,
          body.params.productMolarMass,
          body.params.coeffReactant,
          body.params.coeffProduct
        );
        break;
      case "dilution":
        result = calculateDilution(
          body.params.c1,
          body.params.v1,
          body.params.c2,
          body.params.v2
        );
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Calculation error:", error);
    return NextResponse.json({ error: "Berechnungsfehler" }, { status: 500 });
  }
}
