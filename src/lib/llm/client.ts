import { ChatOpenAI } from "@langchain/openai";

export type LLMProvider = "openai" | "grok";

export function getLLMProvider(): LLMProvider {
  if (process.env.GROK_API_KEY || process.env.XAI_API_KEY) return "grok";
  return "openai";
}

export function isLLMAvailable(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY ||
      process.env.GROK_API_KEY ||
      process.env.XAI_API_KEY,
  );
}

export function createChatModel(options?: {
  temperature?: number;
  model?: string;
}): ChatOpenAI {
  const provider = getLLMProvider();
  const temperature = options?.temperature ?? 0.3;

  if (provider === "grok") {
    const apiKey = process.env.GROK_API_KEY ?? process.env.XAI_API_KEY;
    return new ChatOpenAI({
      model: options?.model ?? "grok-3-mini",
      temperature,
      apiKey,
      configuration: {
        baseURL: "https://api.x.ai/v1",
      },
    });
  }

  return new ChatOpenAI({
    model: options?.model ?? "gpt-4o-mini",
    temperature,
    apiKey: process.env.OPENAI_API_KEY,
  });
}