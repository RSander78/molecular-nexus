"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Download, Loader2, AlertTriangle } from "lucide-react";
import { postJson, errorMessage } from "@/lib/api-client";
import { openPrintWindow } from "@/lib/print";
import ErrorBanner from "@/components/ErrorBanner";

function MoleculesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [searchType, setSearchType] = useState<"name" | "smiles" | "formula">(
    (searchParams?.get("type") as any) || "name"
  );
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams?.get("q");
    const t = searchParams?.get("type");
    if (q) {
      setQuery(q);
      if (t) setSearchType(t as any);
      handleSearch(q, (t as any) || "name");
    }
  }, [searchParams]);

  const handleSearch = async (q?: string, t?: string) => {
    const searchQuery = q || query;
    const type = t || searchType;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await postJson("/api/molecules", { query: searchQuery, type }, "Suche fehlgeschlagen");
      setResult(data);
    } catch (err) {
      setError(errorMessage(err, "Netzwerkfehler. Bitte versuchen Sie es erneut."));
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const html = `<!DOCTYPE html><html><head><title>Molecular Nexus - ${result.name}</title>
    <style>body{font-family:'IBM Plex Sans',sans-serif;padding:40px;color:#1a1a2e}
    h1{color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f0f4ff}
    .ghs{background:#fff3cd;padding:12px;border:1px solid #ffc107;border-radius:4px;margin:16px 0}
    </style></head><body>
    <h1>${result.name}</h1>
    <table><tr><th>Eigenschaft</th><th>Wert</th></tr>
    <tr><td>CID</td><td>${result.cid}</td></tr>
    <tr><td>Summenformel</td><td>${result.molecularFormula}</td></tr>
    <tr><td>Molekulargewicht</td><td>${result.molecularWeight?.toFixed(3)} g/mol</td></tr>
    <tr><td>SMILES</td><td><code>${result.canonicalSmiles}</code></td></tr>
    <tr><td>InChIKey</td><td>${result.inchiKey}</td></tr>
    <tr><td>XLogP</td><td>${result.xlogp ?? "N/A"}</td></tr>
    <tr><td>H-Bond Donoren</td><td>${result.hbondDonors}</td></tr>
    <tr><td>H-Bond Akzeptoren</td><td>${result.hbondAcceptors}</td></tr>
    <tr><td>TPSA</td><td>${result.tpsa ?? "N/A"} Å²</td></tr>
    <tr><td>Rotierbare Bindungen</td><td>${result.rotatableBonds}</td></tr>
    </table>
    ${result.ghsClassification ? `<div class="ghs"><strong>GHS-Klassifizierung (CLP/REACH)</strong><br/>
    <strong>Signalwort:</strong> ${result.ghsClassification.signalWord || "N/A"}<br/>
    <strong>H-Sätze:</strong> ${result.ghsClassification.hStatements?.join("; ") || "N/A"}<br/>
    <strong>P-Sätze:</strong> ${result.ghsClassification.pStatements?.slice(0, 5).join("; ") || "N/A"}
    </div>` : ""}
    <p style="color:#666;font-size:12px;margin-top:32px">Generiert von Molecular Nexus · ${new Date().toLocaleDateString("de-DE")} · Datenquelle: PubChem (NCBI)</p>
    </body></html>`;
    openPrintWindow(html);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Molekülsuche</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Durchsuchen Sie die PubChem-Datenbank nach Name, SMILES oder Summenformel
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            <option value="name">Name</option>
            <option value="smiles">SMILES</option>
            <option value="formula">Summenformel</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={
              searchType === "name"
                ? "z.B. Aspirin, Koffein, Ethanol"
                : searchType === "smiles"
                ? "z.B. CC(=O)OC1=CC=CC=C1C(=O)O"
                : "z.B. C9H8O4"
            }
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Suchen
          </button>
        </div>
      </div>

      {/* Error */}
      <ErrorBanner message={error} />

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{result.name}</h2>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF-Export
            </button>
          </div>

          {/* Properties Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Eigenschaft</th>
                  <th className="px-4 py-2.5 text-left font-medium">Wert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="px-4 py-2">PubChem CID</td><td className="px-4 py-2 font-mono">{result.cid}</td></tr>
                <tr><td className="px-4 py-2">Summenformel</td><td className="px-4 py-2 font-mono">{result.molecularFormula}</td></tr>
                <tr><td className="px-4 py-2">Molekulargewicht</td><td className="px-4 py-2">{result.molecularWeight?.toFixed(3)} g/mol</td></tr>
                <tr><td className="px-4 py-2">Kanonische SMILES</td><td className="px-4 py-2 font-mono text-xs break-all">{result.canonicalSmiles}</td></tr>
                <tr><td className="px-4 py-2">InChIKey</td><td className="px-4 py-2 font-mono text-xs">{result.inchiKey}</td></tr>
                <tr><td className="px-4 py-2">XLogP</td><td className="px-4 py-2">{result.xlogp ?? "N/A"}</td></tr>
                <tr><td className="px-4 py-2">H-Bond Donoren</td><td className="px-4 py-2">{result.hbondDonors}</td></tr>
                <tr><td className="px-4 py-2">H-Bond Akzeptoren</td><td className="px-4 py-2">{result.hbondAcceptors}</td></tr>
                <tr><td className="px-4 py-2">TPSA</td><td className="px-4 py-2">{result.tpsa ?? "N/A"} Å²</td></tr>
                <tr><td className="px-4 py-2">Rotierbare Bindungen</td><td className="px-4 py-2">{result.rotatableBonds}</td></tr>
                <tr><td className="px-4 py-2">Komplexität</td><td className="px-4 py-2">{result.complexity ?? "N/A"}</td></tr>
              </tbody>
            </table>
          </div>

          {/* GHS Classification */}
          {result.ghsClassification && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800">
                  GHS-Klassifizierung (CLP-Verordnung / REACH)
                </h3>
              </div>
              {result.ghsClassification.signalWord && (
                <p className="text-sm mb-2">
                  <strong>Signalwort:</strong> {result.ghsClassification.signalWord}
                </p>
              )}
              {result.ghsClassification.hStatements?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium">H-Sätze (Gefahrenhinweise):</p>
                  <ul className="text-sm text-amber-900 list-disc list-inside">
                    {result.ghsClassification.hStatements.slice(0, 8).map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.ghsClassification.pStatements?.length > 0 && (
                <div>
                  <p className="text-sm font-medium">P-Sätze (Sicherheitshinweise):</p>
                  <ul className="text-sm text-amber-900 list-disc list-inside">
                    {result.ghsClassification.pStatements.slice(0, 5).map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MoleculesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <MoleculesContent />
    </Suspense>
  );
}
