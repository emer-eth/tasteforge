import { ChatOpenAI } from "@langchain/openai";

const BLINK_BASE_URL = "https://core.blink.new/api/v1/ai";

export type LLMProvider = "blink" | "openai" | "grok";

export function getLLMProvider(): LLMProvider {
  if (process.env.BLINK_API_KEY) return "blink";
  if (process.env.GROK_API_KEY || process.env.XAI_API_KEY) return "grok";
  return "openai";
}

export function isLLMAvailable(): boolean {
  return Boolean(
    process.env.BLINK_API_KEY ||
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

  if (provider === "blink") {
    return new ChatOpenAI({
      model:
        options?.model ??
        process.env.BLINK_MODEL ??
        "xai/grok-4.1-fast-non-reasoning",
      temperature,
      apiKey: process.env.BLINK_API_KEY,
      configuration: {
        baseURL: BLINK_BASE_URL,
      },
    });
  }

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