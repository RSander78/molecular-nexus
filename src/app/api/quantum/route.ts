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
import { quantumSchema, parseJsonBody } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`quantum:${getClientIp(request)}`, 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const parsed = await parseJsonBody(request, quantumSchema);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const body = parsed.data;
    let result: unknown;

    switch (body.type) {
      case "electron_config":
        result = getElectronConfiguration(body.params.atomicNumber);
        break;
      case "quantum_numbers":
        result = getQuantumNumbers(body.params.atomicNumber, body.params.electronNumber);
        break;
      case "hydrogen_energy":
        result = calculateHydrogenEnergy(body.params.n);
        break;
      case "particle_in_box":
        result = calculateParticleInBox(body.params.n, body.params.length, body.params.mass);
        break;
      case "de_broglie":
        result = calculateDeBroglie(body.params.mass, body.params.velocity);
        break;
      case "heisenberg":
        result = calculateHeisenberg(body.params.deltaX);
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
          { role: "user", content: `Molekül: ${body.params.molecule}` },
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
          { role: "user", content: `Molekül (SMILES): ${body.params.smiles}` },
        ]);
        result = { analysis: specResult };
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quantum error:", error);
    return NextResponse.json({ error: "Quantenchemie-Berechnungsfehler" }, { status: 500 });
  }
}
