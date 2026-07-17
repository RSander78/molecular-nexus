import { NextResponse } from "next/server";
import { jsonError, withErrorHandling } from "@/lib/api";
import {
  calculateMolarMass,
  calculateConcentration,
  calculatePH,
  calculateStoichiometry,
  calculateDilution,
} from "@/lib/chemistry";

export const POST = withErrorHandling("Calculation error", "Berechnungsfehler", async (request) => {
  const { type, params } = await request.json();
  let result: any;

  switch (type) {
    case "molar_mass":
      result = calculateMolarMass(params.formula);
      if (!result) return jsonError("Ungültige Formel", 400);
      break;
    case "concentration":
      result = calculateConcentration(params.moles, params.volume);
      break;
    case "ph":
      result = calculatePH(params.concentration, params.acidBaseType, params.ka);
      break;
    case "stoichiometry":
      result = calculateStoichiometry(
        params.reactantMass,
        params.reactantMolarMass,
        params.productMolarMass,
        params.coeffReactant,
        params.coeffProduct
      );
      break;
    case "dilution":
      result = calculateDilution(params.c1, params.v1, params.c2, params.v2);
      break;
    default:
      return jsonError("Unbekannter Berechnungstyp", 400);
  }

  return NextResponse.json(result);
});
