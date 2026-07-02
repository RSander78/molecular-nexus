"use client";

import { useState } from "react";
import { Zap, Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ReactionsPage() {
  const [reactants, setReactants] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    if (!reactants.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles: reactants, type: "reaction" }),
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
        <h1 className="text-xl font-bold">Reaktionsvorhersage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vorhersage von Reaktionsprodukten, Mechanismen und Bedingungen
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <label className="block text-sm font-medium mb-2">
          Reaktanten (SMILES, durch + getrennt)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={reactants}
            onChange={(e) => setReactants(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePredict()}
            placeholder="z.B. CC(=O)Cl + CCO (Acetylchlorid + Ethanol)"
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handlePredict}
            disabled={loading || !reactants.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Vorhersagen
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Reaktionsanalyse</h2>
            <button
              onClick={() => {
                const w = window.open("", "_blank");
                w?.document.write(`<html><head><title>Reaktionsvorhersage</title><style>body{font-family:'IBM Plex Sans',sans-serif;padding:40px;max-width:800px;margin:0 auto}</style></head><body><h1>Reaktionsvorhersage</h1><p><strong>Reaktanten:</strong> <code>${reactants}</code></p><pre style="white-space:pre-wrap">${result}</pre></body></html>`);
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
