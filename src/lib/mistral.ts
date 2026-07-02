import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function invokeMistral(
  messages: ChatMessage[],
  options?: { stream?: boolean; maxTokens?: number }
): Promise<string> {
  const response = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages,
    maxTokens: options?.maxTokens ?? 4096,
  });

  return response.choices?.[0]?.message?.content as string ?? "";
}

export async function* streamMistral(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const response = await mistral.chat.stream({
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

export { mistral };
