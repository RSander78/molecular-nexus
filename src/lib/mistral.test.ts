import { describe, it, expect, vi, beforeEach } from "vitest";

const { completeMock, streamMock } = vi.hoisted(() => ({
  completeMock: vi.fn(),
  streamMock: vi.fn(),
}));

vi.mock("@mistralai/mistralai", () => ({
  Mistral: vi.fn(() => ({
    chat: { complete: completeMock, stream: streamMock },
  })),
}));

import { invokeMistral, streamMistral, type ChatMessage } from "./mistral";

const messages: ChatMessage[] = [{ role: "user", content: "Hi" }];

describe("invokeMistral", () => {
  beforeEach(() => {
    completeMock.mockReset();
  });

  it("returns the assistant message content", async () => {
    completeMock.mockResolvedValue({
      choices: [{ message: { content: "Hello there" } }],
    });

    const result = await invokeMistral(messages);

    expect(result).toBe("Hello there");
    expect(completeMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: "mistral-large-latest", maxTokens: 4096 })
    );
  });

  it("passes a custom maxTokens option", async () => {
    completeMock.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    await invokeMistral(messages, { maxTokens: 128 });

    expect(completeMock).toHaveBeenCalledWith(
      expect.objectContaining({ maxTokens: 128 })
    );
  });

  it("returns an empty string when there is no content", async () => {
    completeMock.mockResolvedValue({ choices: [] });
    expect(await invokeMistral(messages)).toBe("");
  });
});

describe("streamMistral", () => {
  beforeEach(() => {
    streamMock.mockReset();
  });

  it("yields non-empty content chunks", async () => {
    streamMock.mockResolvedValue(
      (async function* () {
        yield { data: { choices: [{ delta: { content: "Hel" } }] } };
        yield { data: { choices: [{ delta: { content: "" } }] } };
        yield { data: { choices: [{ delta: { content: "lo" } }] } };
        yield { data: { choices: [{ delta: {} }] } };
      })()
    );

    const chunks: string[] = [];
    for await (const chunk of streamMistral(messages)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["Hel", "lo"]);
  });
});
