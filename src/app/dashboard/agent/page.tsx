"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChemAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Chat-Fehler");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Kein Antwort-Stream verfügbar");
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";
      let streamError: string | null = null;

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Buffer across reads so a `data:` line split over chunk boundaries is
        // not dropped. Only complete lines (ending in "\n") are processed.
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break outer;
          let parsed: { content?: string; error?: string };
          try {
            parsed = JSON.parse(data);
          } catch (parseError) {
            // A malformed complete SSE line is unexpected: surface it rather
            // than silently discarding it.
            console.error("Fehler beim Parsen des Chat-Streams:", parseError, data);
            continue;
          }
          if (parsed.error) {
            streamError = parsed.error;
            break outer;
          }
          if (parsed.content) {
            assistantContent += parsed.content;
            setMessages([
              ...newMessages,
              { role: "assistant", content: assistantContent },
            ]);
          }
        }
      }

      if (streamError) {
        throw new Error(streamError);
      }
    } catch (error) {
      console.error("Chat-Fehler:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold">Chemie-Assistent</h1>
          <p className="text-sm text-muted-foreground">
            KI-gestützter Fachassistent für chemische Fragen aller Art
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground"
            title="Chat leeren"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Stellen Sie eine Frage zu Chemie, Molekülen, Reaktionen oder Berechnungen.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {[
                "Was ist der Mechanismus einer SN2-Reaktion?",
                "Erkläre die Hybridisierung von Kohlenstoff",
                "Berechne den pH-Wert von 0.1M HCl",
                "Was sind die REACH-Anforderungen für neue Stoffe?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-xs p-3 rounded-md border border-border hover:border-blue-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="pt-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stellen Sie eine chemische Frage..."
            className="flex-1 px-4 py-2.5 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
