"use client";

import { useState } from "react";
import { FlaskConical, Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AdmetPage() {
  const [smiles, setSmiles] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    if (!smiles.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles, type: "admet" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Vorhersage fehlgeschlagen");
        return;
      }

      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">ADMET-Eigenschaftsvorhersage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vorhersage von Absorption, Distribution, Metabolismus, Exkretion und Toxizität
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <label className="block text-sm font-medium mb-2">SMILES-Notation des Moleküls</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={smiles}
            onChange={(e) => setSmiles(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePredict()}
            placeholder="z.B. CC(=O)OC1=CC=CC=C1C(=O)O (Aspirin)"
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handlePredict}
            disabled={loading || !smiles.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Analysieren
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">ADMET-Analyse</h2>
            <button
              onClick={() => {
                const w = window.open("", "_blank");
                w?.document.write(`<html><head><title>ADMET-Analyse</title><style>body{font-family:'IBM Plex Sans',sans-serif;padding:40px;max-width:800px;margin:0 auto}</style></head><body><h1>ADMET-Analyse: ${smiles}</h1><pre style="white-space:pre-wrap">${result}</pre></body></html>`);
                w?.document.close();
                w?.print();
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
