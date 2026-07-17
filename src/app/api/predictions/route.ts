import { NextResponse } from "next/server";
import { jsonError, withErrorHandling } from "@/lib/api";
import { invokeMistral } from "@/lib/mistral";

const PROMPTS: Record<string, string> = {
  admet: `Du bist ein Experte für ADMET-Vorhersagen (Absorption, Distribution, Metabolismus, Exkretion, Toxizität).
Analysiere das folgende Molekül und gib eine strukturierte Vorhersage zu folgenden Parametern:
- Orale Bioverfügbarkeit (hoch/mittel/niedrig + Begründung)
- Lipinski's Rule of Five (Erfüllung ja/nein + Details)
- Metabolische Stabilität (CYP-Inhibition)
- hERG-Toxizitätsrisiko
- Hepatotoxizität
- Mutagenität (Ames-Test-Vorhersage)
- Wasserlöslichkeit (LogS-Schätzung)
- Blut-Hirn-Schranke (Permeabilität)
Antworte im JSON-Format mit den Feldern: absorption, distribution, metabolism, excretion, toxicity. Jedes Feld enthält: score (0-100), risk (low/medium/high), details (string).`,

  reaction: `Du bist ein Experte für organische Reaktionsmechanismen und Syntheseplanung.
Analysiere die gegebenen Reaktanten und sage die wahrscheinlichsten Produkte und Reaktionswege vorher.
Gib an:
- Hauptprodukt(e) mit SMILES-Notation
- Reaktionstyp (Substitution, Addition, Eliminierung, etc.)
- Mechanismus (SN1, SN2, E1, E2, radikalisch, etc.)
- Reaktionsbedingungen (Temperatur, Lösungsmittel, Katalysator)
- Ausbeute-Schätzung (%)
- Nebenprodukte
- Stereochemie des Produkts
Antworte im JSON-Format mit: products (array), mechanism, conditions, yield_estimate, byproducts (array).`,

  qsar: `Du bist ein Experte für QSAR/QSPR-Modellierung (Quantitative Struktur-Aktivitäts/Eigenschafts-Beziehungen).
Analysiere das folgende Molekül und berechne/schätze:
- Biologische Aktivität (IC50-Schätzung für gängige Targets)
- Deskriptoren: TopoPSA, Wiener-Index, Zagreb-Index, Randić-Index
- Lipophilie (cLogP, cLogD bei pH 7.4)
- Druglikeness-Score (QED)
- Synthetische Zugänglichkeit (SA-Score 1-10)
- Ähnlichkeit zu bekannten Wirkstoffen
Antworte im JSON-Format mit: descriptors (object), activity_prediction (object), druglikeness (object), similar_drugs (array).`
};

export const POST = withErrorHandling("Prediction error", "Vorhersage fehlgeschlagen", async (request) => {
  const { smiles, type } = await request.json();
  if (!smiles || !type || !PROMPTS[type]) {
    return jsonError("SMILES und gültiger Typ sind erforderlich", 400);
  }

  const systemPrompt = PROMPTS[type];
  const userMessage = type === "reaction"
    ? `Reaktanten: ${smiles}\n\nAnalysiere diese Reaktion und sage die Produkte vorher.`
    : `Molekül (SMILES): ${smiles}\n\nFühre die Analyse durch.`;

  const result = await invokeMistral([
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ]);

  return NextResponse.json({ result });
});
