import { NextResponse } from "next/server";
import { z } from "zod";
import { runChatAssistant } from "@/lib/chat/assistant";
import { isLLMAvailable } from "@/lib/llm/client";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(messageSchema).max(20).optional(),
  context: z
    .object({
      walletAddress: z.string().optional(),
      hasResults: z.boolean().optional(),
      collectorMode: z.string().optional(),
      tasteArchetype: z.string().optional(),
      catalogSize: z.number().optional(),
      holdingsCount: z.number().optional(),
      isStale: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, context } = bodySchema.parse(body);

    const { reply, mode } = await runChatAssistant(
      message,
      history ?? [],
      context,
    );

    return NextResponse.json({
      reply,
      mode,
      llmAvailable: isLLMAvailable(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}