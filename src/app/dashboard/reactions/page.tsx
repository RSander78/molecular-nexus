"use client";

import { Zap } from "lucide-react";
import PredictionModule from "@/components/PredictionModule";

export default function ReactionsPage() {
  return (
    <PredictionModule
      title="Reaktionsvorhersage"
      description="Vorhersage von Reaktionsprodukten, Mechanismen und Bedingungen"
      inputLabel="Reaktanten (SMILES, durch + getrennt)"
      placeholder="z.B. CC(=O)Cl + CCO (Acetylchlorid + Ethanol)"
      buttonLabel="Vorhersagen"
      buttonIcon={Zap}
      predictionType="reaction"
      resultTitle="Reaktionsanalyse"
      fallbackError="Vorhersage fehlgeschlagen"
      printDocTitle="Reaktionsvorhersage"
      buildPrintHeading={() => "Reaktionsvorhersage"}
      buildPrintBody={(input, result) =>
        `<p><strong>Reaktanten:</strong> <code>${input}</code></p><pre style="white-space:pre-wrap">${result}</pre>`
      }
    />
  );
}
