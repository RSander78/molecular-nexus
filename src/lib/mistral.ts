import { Mistral } from "@mistralai/mistralai";

// Lazily instantiate the client so a missing key surfaces a clear error at
// request time (rather than an opaque failure from a `!` assertion, or a
// crash at module-load/build time).
let client: Mistral | null = null;

function getClient(): Mistral {
  if (!client) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "MISTRAL_API_KEY ist nicht gesetzt. Bitte konfigurieren Sie die Umgebungsvariable."
      );
    }
    client = new Mistral({ apiKey });
  }
  return client;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function invokeMistral(
  messages: ChatMessage[],
  options?: { stream?: boolean; maxTokens?: number }
): Promise<string> {
  const response = await getClient().chat.complete({
    model: "mistral-large-latest",
    messages,
    maxTokens: options?.maxTokens ?? 4096,
  });

  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("Mistral lieferte eine leere Antwort");
  }
  return content;
}

export async function* streamMistral(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const response = await getClient().chat.stream({
    model: "mistral-large-latest",
    messages,
    maxTokens: 4096,
  });

  for await (const chunk of response) {
    const content = chunk.data?.choices?.[0]?.delta?.content;
    if (content) {
      yield content as string;
    }
  }
}

