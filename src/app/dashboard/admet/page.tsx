"use client";

import { FlaskConical } from "lucide-react";
import PredictionModule from "@/components/PredictionModule";

export default function AdmetPage() {
  return (
    <PredictionModule
      title="ADMET-Eigenschaftsvorhersage"
      description="Vorhersage von Absorption, Distribution, Metabolismus, Exkretion und Toxizität"
      inputLabel="SMILES-Notation des Moleküls"
      placeholder="z.B. CC(=O)OC1=CC=CC=C1C(=O)O (Aspirin)"
      buttonLabel="Analysieren"
      buttonIcon={FlaskConical}
      predictionType="admet"
      resultTitle="ADMET-Analyse"
      fallbackError="Vorhersage fehlgeschlagen"
      printDocTitle="ADMET-Analyse"
      buildPrintHeading={(input) => `ADMET-Analyse: ${input}`}
      buildPrintBody={(_input, result) => `<pre style="white-space:pre-wrap">${result}</pre>`}
    />
  );
}
