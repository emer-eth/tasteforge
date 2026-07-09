import { NextResponse } from "next/server";
import { z } from "zod";
import {
  runTasteForgeAgent,
  type AnalysisProgressEvent,
} from "@/lib/agents/taste-forge-agent";

const bodySchema = z.object({
  walletAddress: z.string().min(42).max(42),
  socialText: z.string().max(2000).optional(),
  xHandle: z.string().max(50).optional(),
  tasteQuiz: z.array(z.string().max(40)).max(20).optional(),
  stream: z.boolean().optional(),
  skipCache: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = bodySchema.parse(body);

    if (input.stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const send = (payload: Record<string, unknown>) => {
            controller.enqueue(
              encoder.encode(`${JSON.stringify(payload)}\n`),
            );
          };

          try {
            const result = await runTasteForgeAgent(input, {
              skipCache: input.skipCache,
              onProgress: (event: AnalysisProgressEvent) => {
                send({ type: "progress", ...event });
              },
            });
            send({ type: "result", result, fromCache: false });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            send({ type: "error", message });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-store",
        },
      });
    }

    const result = await runTasteForgeAgent(input, {
      skipCache: input.skipCache,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}