"use client";

import { useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { postJson, errorMessage } from "@/lib/api-client";
import ErrorBanner from "@/components/ErrorBanner";

type CalcType = "molar_mass" | "concentration" | "ph" | "stoichiometry" | "dilution";

export default function CalculationsPage() {
  const [activeCalc, setActiveCalc] = useState<CalcType>("molar_mass");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [formula, setFormula] = useState("");
  const [moles, setMoles] = useState("");
  const [volume, setVolume] = useState("");
  const [concentration, setConcentration] = useState("");
  const [acidType, setAcidType] = useState("strong_acid");
  const [ka, setKa] = useState("");
  const [reactantMass, setReactantMass] = useState("");
  const [reactantMM, setReactantMM] = useState("");
  const [productMM, setProductMM] = useState("");
  const [coeffR, setCoeffR] = useState("1");
  const [coeffP, setCoeffP] = useState("1");
  const [c1, setC1] = useState("");
  const [v1, setV1] = useState("");
  const [c2, setC2] = useState("");
  const [v2, setV2] = useState("");

  const calculate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    let params: any = {};
    switch (activeCalc) {
      case "molar_mass":
        params = { formula };
        break;
      case "concentration":
        params = { moles: parseFloat(moles), volume: parseFloat(volume) };
        break;
      case "ph":
        params = { concentration: parseFloat(concentration), acidBaseType: acidType, ka: ka ? parseFloat(ka) : undefined };
        break;
      case "stoichiometry":
        params = { reactantMass: parseFloat(reactantMass), reactantMolarMass: parseFloat(reactantMM), productMolarMass: parseFloat(productMM), coeffReactant: parseInt(coeffR), coeffProduct: parseInt(coeffP) };
        break;
      case "dilution":
        params = { c1: c1 ? parseFloat(c1) : null, v1: v1 ? parseFloat(v1) : null, c2: c2 ? parseFloat(c2) : null, v2: v2 ? parseFloat(v2) : null };
        break;
    }

    try {
      setResult(
        await postJson("/api/calculations", { type: activeCalc, params }, "Berechnung fehlgeschlagen")
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const calcs = [
    { id: "molar_mass" as CalcType, label: "Molmasse" },
    { id: "concentration" as CalcType, label: "Konzentration" },
    { id: "ph" as CalcType, label: "pH-Wert" },
    { id: "stoichiometry" as CalcType, label: "Stöchiometrie" },
    { id: "dilution" as CalcType, label: "Verdünnung" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Chemische Berechnungen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Molmasse, Konzentration, pH-Wert, Stöchiometrie und Verdünnungsrechner
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {calcs.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveCalc(c.id); setResult(null); setError(""); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCalc === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Forms */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        {activeCalc === "molar_mass" && (
          <div>
            <label className="block text-sm font-medium mb-2">Summenformel</label>
            <input value={formula} onChange={(e) => setFormula(e.target.value)} onKeyDown={(e) => e.key === "Enter" && calculate()} placeholder="z.B. H2O, C6H12O6, NaCl" className="w-full px-3 py-2 border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}

        {activeCalc === "concentration" && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Stoffmenge (mol)</label><input type="number" step="any" value={moles} onChange={(e) => setMoles(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Volumen (L)</label><input type="number" step="any" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        {activeCalc === "ph" && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">Konzentration (mol/L)</label><input type="number" step="any" value={concentration} onChange={(e) => setConcentration(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Typ</label><select value={acidType} onChange={(e) => setAcidType(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm"><option value="strong_acid">Starke Säure</option><option value="strong_base">Starke Base</option><option value="weak_acid">Schwache Säure</option><option value="weak_base">Schwache Base</option></select></div>
            {(acidType === "weak_acid" || acidType === "weak_base") && (
              <div><label className="block text-sm font-medium mb-2">Ka/Kb</label><input type="number" step="any" value={ka} onChange={(e) => setKa(e.target.value)} placeholder="z.B. 1.8e-5" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            )}
          </div>
        )}

        {activeCalc === "stoichiometry" && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Reaktant-Masse (g)</label><input type="number" step="any" value={reactantMass} onChange={(e) => setReactantMass(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Reaktant M (g/mol)</label><input type="number" step="any" value={reactantMM} onChange={(e) => setReactantMM(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Produkt M (g/mol)</label><input type="number" step="any" value={productMM} onChange={(e) => setProductMM(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Koeff. Reaktant</label><input type="number" value={coeffR} onChange={(e) => setCoeffR(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">Koeff. Produkt</label><input type="number" value={coeffP} onChange={(e) => setCoeffP(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        {activeCalc === "dilution" && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">c₁ (mol/L)</label><input type="number" step="any" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Leer = berechnen" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">V₁ (mL)</label><input type="number" step="any" value={v1} onChange={(e) => setV1(e.target.value)} placeholder="Leer = berechnen" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">c₂ (mol/L)</label><input type="number" step="any" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Leer = berechnen" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-2">V₂ (mL)</label><input type="number" step="any" value={v2} onChange={(e) => setV2(e.target.value)} placeholder="Leer = berechnen" className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        <button onClick={calculate} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          Berechnen
        </button>
      </div>

      <ErrorBanner message={error} />

      {result && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-3">Ergebnis</h2>
          <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
