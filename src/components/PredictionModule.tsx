"use client";

import { ComponentType, useState } from "react";
import { Loader2, Download, LucideProps } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { postJson, errorMessage } from "@/lib/api-client";
import { printReport } from "@/lib/print";
import ErrorBanner from "@/components/ErrorBanner";

interface PredictionModuleProps {
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  buttonLabel: string;
  buttonIcon: ComponentType<LucideProps>;
  predictionType: string;
  resultTitle: string;
  fallbackError: string;
  printDocTitle: string;
  buildPrintBody: (input: string, result: string) => string;
  buildPrintHeading: (input: string) => string;
}

export default function PredictionModule({
  title,
  description,
  inputLabel,
  placeholder,
  buttonLabel,
  buttonIcon: ButtonIcon,
  predictionType,
  resultTitle,
  fallbackError,
  printDocTitle,
  buildPrintBody,
  buildPrintHeading,
}: PredictionModuleProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const data = await postJson<{ result: string }>(
        "/api/predictions",
        { smiles: input, type: predictionType },
        fallbackError
      );
      setResult(data.result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <label className="block text-sm font-medium mb-2">{inputLabel}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ButtonIcon className="w-4 h-4" />}
            {buttonLabel}
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {result && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{resultTitle}</h2>
            <button
              onClick={() =>
                printReport(printDocTitle, buildPrintHeading(input), buildPrintBody(input, result))
              }
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
