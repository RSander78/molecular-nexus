"use client";

import { useState } from "react";
import { Atom, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { postJson, errorMessage } from "@/lib/api-client";
import ErrorBanner from "@/components/ErrorBanner";

type QuantumTab = "electron_config" | "quantum_numbers" | "energy_levels" | "de_broglie" | "uncertainty" | "mo_analysis" | "spectroscopy";

export default function QuantumPage() {
  const [activeTab, setActiveTab] = useState<QuantumTab>("electron_config");
  const [result, setResult] = useState<any>(null);
  const [llmResult, setLlmResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [atomicNumber, setAtomicNumber] = useState("");
  const [electronNumber, setElectronNumber] = useState("");
  const [nLevel, setNLevel] = useState("");
  const [mass, setMass] = useState("");
  const [velocity, setVelocity] = useState("");
  const [deltaX, setDeltaX] = useState("");
  const [smiles, setSmiles] = useState("");

  const calculate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setLlmResult("");

    let params: any = {};
    switch (activeTab) {
      case "electron_config":
        params = { atomicNumber: parseInt(atomicNumber) };
        break;
      case "quantum_numbers":
        params = { electronNumber: parseInt(electronNumber) };
        break;
      case "energy_levels":
        params = { n: parseInt(nLevel), atomicNumber: atomicNumber ? parseInt(atomicNumber) : 1 };
        break;
      case "de_broglie":
        params = { mass: parseFloat(mass), velocity: parseFloat(velocity) };
        break;
      case "uncertainty":
        params = { deltaX: parseFloat(deltaX), mass: mass ? parseFloat(mass) : undefined };
        break;
      case "mo_analysis":
      case "spectroscopy":
        params = { smiles };
        break;
    }

    try {
      const data = await postJson<any>(
        "/api/quantum",
        { type: activeTab, params },
        "Berechnung fehlgeschlagen"
      );
      if (data.result && typeof data.result === "string") {
        setLlmResult(data.result);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "electron_config" as QuantumTab, label: "e⁻-Konfiguration" },
    { id: "quantum_numbers" as QuantumTab, label: "Quantenzahlen" },
    { id: "energy_levels" as QuantumTab, label: "Energieniveaus" },
    { id: "de_broglie" as QuantumTab, label: "De Broglie" },
    { id: "uncertainty" as QuantumTab, label: "Heisenberg" },
    { id: "mo_analysis" as QuantumTab, label: "MO-Analyse" },
    { id: "spectroscopy" as QuantumTab, label: "Spektroskopie" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quantenchemie</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Elektronenkonfiguration, Quantenzahlen, Energieniveaus, MO-Theorie und Spektroskopie
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setResult(null); setLlmResult(""); setError(""); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Forms */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        {activeTab === "electron_config" && (
          <div>
            <label className="block text-sm font-medium mb-2">Ordnungszahl (Z)</label>
            <input type="number" min="1" max="118" value={atomicNumber} onChange={(e) => setAtomicNumber(e.target.value)} placeholder="z.B. 26 (Eisen)" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}

        {activeTab === "quantum_numbers" && (
          <div>
            <label className="block text-sm font-medium mb-2">Elektronennummer</label>
            <input type="number" min="1" value={electronNumber} onChange={(e) => setElectronNumber(e.target.value)} placeholder="z.B. 5 (5. Elektron)" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}

        {activeTab === "energy_levels" && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Hauptquantenzahl (n)</label><input type="number" min="1" value={nLevel} onChange={(e) => setNLevel(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Ordnungszahl (Z, Standard: 1)</label><input type="number" min="1" value={atomicNumber} onChange={(e) => setAtomicNumber(e.target.value)} placeholder="1 (H)" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        {activeTab === "de_broglie" && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Masse (kg)</label><input type="number" step="any" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="z.B. 9.109e-31 (Elektron)" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Geschwindigkeit (m/s)</label><input type="number" step="any" value={velocity} onChange={(e) => setVelocity(e.target.value)} placeholder="z.B. 1e6" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        {activeTab === "uncertainty" && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Ortsunschärfe Δx (m)</label><input type="number" step="any" value={deltaX} onChange={(e) => setDeltaX(e.target.value)} placeholder="z.B. 1e-10" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Masse (kg, optional)</label><input type="number" step="any" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="z.B. 9.109e-31" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        {(activeTab === "mo_analysis" || activeTab === "spectroscopy") && (
          <div>
            <label className="block text-sm font-medium mb-2">SMILES-Notation</label>
            <input type="text" value={smiles} onChange={(e) => setSmiles(e.target.value)} placeholder="z.B. C=C (Ethen) oder c1ccccc1 (Benzol)" className="w-full px-3 py-2 border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}

        <button onClick={calculate} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Atom className="w-4 h-4" />}
          Berechnen
        </button>
      </div>

      <ErrorBanner message={error} />

      {result && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-3">Ergebnis</h2>
          <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {llmResult && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-3">Analyse</h2>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{llmResult}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
