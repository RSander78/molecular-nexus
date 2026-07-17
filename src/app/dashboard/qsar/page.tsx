"use client";

import { BarChart3 } from "lucide-react";
import PredictionModule from "@/components/PredictionModule";

export default function QsarPage() {
  return (
    <PredictionModule
      title="QSAR/QSPR-Modellierung"
      description="Quantitative Struktur-Aktivitäts- und Struktur-Eigenschafts-Beziehungen"
      inputLabel="SMILES-Notation"
      placeholder="z.B. CC(C)CC1=CC=C(C=C1)C(C)C(=O)O (Ibuprofen)"
      buttonLabel="Analysieren"
      buttonIcon={BarChart3}
      predictionType="qsar"
      resultTitle="QSAR/QSPR-Analyse"
      fallbackError="Analyse fehlgeschlagen"
      printDocTitle="QSAR-Analyse"
      buildPrintHeading={(input) => `QSAR/QSPR-Analyse: ${input}`}
      buildPrintBody={(_input, result) => `<pre style="white-space:pre-wrap">${result}</pre>`}
    />
  );
}
