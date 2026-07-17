import { streamMistral, ChatMessage } from "@/lib/mistral";
import { chatSchema, parseJsonBody } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `Du bist ein hochqualifizierter Chemie-Fachassistent der Plattform "Molecular Nexus". 
Du beantwortest Fragen zu allen Bereichen der Chemie: organische, anorganische, physikalische Chemie, 
Pharmazie, Polymerchemie, Analytik, Verfahrenstechnik, Quantenchemie und EU-Regulatorik (REACH, CLP, GHS).

Regeln:
- Antworte stets fachlich korrekt und präzise
- Verwende chemische Notation (Summenformeln, Reaktionsgleichungen, SMILES)
- Gib bei Unsicherheit den Konfidenzgrad an
- Weise auf Sicherheitsaspekte hin (GHS-Kennzeichnung)
- Antworte auf Deutsch, es sei denn, die Frage ist auf Englisch
- Strukturiere deine Antworten mit Markdown (Überschriften, Listen, Tabellen)
- Gib bei Berechnungen den Lösungsweg an`;

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`chat:${getClientIp(request)}`, 20, 60_000);
    if (!limit.allowed) {
      return new Response("Zu viele Anfragen", {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    const parsed = await parseJsonBody(request, chatSchema);
    if (!parsed.success) {
      return new Response(parsed.error, { status: 400 });
    }

    const chatMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Streaming Response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamMistral(chatMessages)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Streaming-Fehler" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
}
