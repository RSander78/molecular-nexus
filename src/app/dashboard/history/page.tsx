"use client";

import { useState, useEffect } from "react";
import { History, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HistoryEntry {
  id: string;
  type: string;
  input: string;
  result: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("molecular-nexus-history");
    if (stored) {
      try {
        setAnalyses(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const deleteEntry = (id: string) => {
    const updated = analyses.filter((a) => a.id !== id);
    setAnalyses(updated);
    localStorage.setItem("molecular-nexus-history", JSON.stringify(updated));
    toast.success("Eintrag gelöscht");
  };

  const typeLabels: Record<string, string> = {
    MOLECULE_SEARCH: "Molekülsuche",
    ADMET_PREDICTION: "ADMET-Vorhersage",
    REACTION_PREDICTION: "Reaktionsvorhersage",
    QSAR_ANALYSIS: "QSAR/QSPR",
    CALCULATION: "Berechnung",
    QUANTUM_CHEMISTRY: "Quantenchemie",
    CHAT_CONVERSATION: "Chat",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Analyse-Historie</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ihre gespeicherten Analysen und Berechnungen (lokal im Browser)
        </p>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Noch keine Analysen durchgeführt</p>
          <p className="text-xs text-muted-foreground mt-2">
            Analysen werden automatisch gespeichert, wenn Sie Module verwenden
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((entry) => (
            <div key={entry.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                    {typeLabels[entry.type] || entry.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("de-DE")}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{entry.input}</p>
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
