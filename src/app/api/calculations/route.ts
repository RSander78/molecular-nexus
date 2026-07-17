import { NextResponse } from "next/server";
import {
  calculateMolarMass,
  calculateConcentration,
  calculatePH,
  calculateStoichiometry,
  calculateDilution,
} from "@/lib/chemistry";

export async function POST(request: Request) {
  let type: string;
  let params: Record<string, any>;
  try {
    const body = await request.json();
    type = body.type;
    params = body.params;
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  if (!type || typeof params !== "object" || params === null) {
    return NextResponse.json({ error: "Typ und Parameter sind erforderlich" }, { status: 400 });
  }

  try {
    let result: any;

    switch (type) {
      case "molar_mass":
        result = calculateMolarMass(params.formula);
        if (!result) return NextResponse.json({ error: "Ungültige Formel" }, { status: 400 });
        break;
      case "concentration":
        result = calculateConcentration(params.moles, params.volume);
        if (!result) return NextResponse.json({ error: "Volumen muss größer als 0 sein" }, { status: 400 });
        break;
      case "ph":
        result = calculatePH(params.concentration, params.acidBaseType, params.ka);
        if (!result) return NextResponse.json({ error: "Ungültige Konzentration oder Ka/Kb" }, { status: 400 });
        break;
      case "stoichiometry":
        result = calculateStoichiometry(
          params.reactantMass,
          params.reactantMolarMass,
          params.productMolarMass,
          params.coeffReactant,
          params.coeffProduct
        );
        if (!result) return NextResponse.json({ error: "Ungültige Werte für Stöchiometrie" }, { status: 400 });
        break;
      case "dilution":
        result = calculateDilution(params.c1, params.v1, params.c2, params.v2);
        if (!result) return NextResponse.json({ error: "Genau ein Wert muss leer bleiben, die übrigen müssen positiv sein" }, { status: 400 });
        break;
      default:
        return NextResponse.json({ error: "Unbekannter Berechnungstyp" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Calculation error:", error);
    return NextResponse.json({ error: "Berechnungsfehler" }, { status: 500 });
  }
}
