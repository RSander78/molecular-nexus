import { NextResponse } from "next/server";
import { invokeMistral } from "@/lib/mistral";
import {
  getElectronConfiguration,
  getQuantumNumbers,
  calculateHydrogenEnergy,
  calculateParticleInBox,
  calculateDeBroglie,
  calculateHeisenberg,
} from "@/lib/quantum";

// Synchronous physics calculations throw Error on invalid input; these are
// client mistakes and must be reported as 400, not swallowed into a 500.
class ValidationError extends Error {}

function runSync<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : String(error));
  }
}

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
      case "electron_config":
        result = runSync(() => getElectronConfiguration(params.atomicNumber));
        break;
      case "quantum_numbers":
        result = runSync(() => getQuantumNumbers(params.atomicNumber, params.electronNumber));
        break;
      case "hydrogen_energy":
        result = runSync(() => calculateHydrogenEnergy(params.n));
        break;
      case "particle_in_box":
        result = runSync(() => calculateParticleInBox(params.n, params.length, params.mass));
        break;
      case "de_broglie":
        result = runSync(() => calculateDeBroglie(params.mass, params.velocity));
        break;
      case "heisenberg":
        result = runSync(() => calculateHeisenberg(params.deltaX));
        break;
      case "mo_analysis":
        const moResult = await invokeMistral([
          {
            role: "system",
            content: `Du bist ein Experte für Molekülorbitaltheorie. Analysiere das Molekül und gib:
- Bindungsordnung
- HOMO-Energie und -Charakter
- LUMO-Energie und -Charakter
- Bindungstyp (σ, π)
- Magnetische Eigenschaften (diamagnetisch/paramagnetisch)
Antworte im JSON-Format.`,
          },
          { role: "user", content: `Molekül: ${params.molecule}` },
        ]);
        result = { analysis: moResult };
        break;
      case "spectroscopy":
        const specResult = await invokeMistral([
          {
            role: "system",
            content: `Du bist ein Experte für Spektroskopie. Sage die spektroskopischen Eigenschaften des Moleküls vorher:
- UV/Vis: λmax, Extinktionskoeffizient, Chromophore
- IR: Charakteristische Banden (cm⁻¹), funktionelle Gruppen
- ¹H-NMR: Chemische Verschiebungen (δ ppm), Multiplizitäten, Kopplungskonstanten
- ¹³C-NMR: Chemische Verschiebungen
- MS: Molekülpeak, charakteristische Fragmentierungen
Antworte im JSON-Format mit Feldern: uv_vis, ir, h_nmr, c_nmr, ms.`,
          },
          { role: "user", content: `Molekül (SMILES): ${params.smiles}` },
        ]);
        result = { analysis: specResult };
        break;
      default:
        return NextResponse.json({ error: "Unbekannter Quantenchemie-Typ" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Quantum error:", error);
    return NextResponse.json({ error: "Quantenchemie-Berechnungsfehler" }, { status: 500 });
  }
}
