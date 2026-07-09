"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SUGGESTED_QUESTIONS,
  type ChatContext,
  type ChatMessage,
} from "@/lib/chat/assistant";

interface TasteAssistantProps {
  context?: ChatContext;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TasteAssistant({
  context,
  open: controlledOpen,
  onOpenChange,
}: TasteAssistantProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const current = controlledOpen ?? internalOpen;
    const next = typeof value === "function" ? value(current) : value;
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your TasteForge guide. Ask anything about wallets, taste analysis, recommendations, or Renaiss.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"llm" | "guide" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, isLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: messages,
            context,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Chat request failed");
        }

        const data = await response.json();
        setMode(data.mode ?? null);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              err instanceof Error
                ? err.message
                : "Something went wrong — try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [context, isLoading, messages],
  );

  if (!open) return null;

  return (
    <div
      className="panel-violet fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl shadow-[0_24px_80px_-20px_rgba(167,139,250,0.35)] sm:bottom-6 sm:right-6 lg:bottom-6"
          style={{ maxHeight: "min(70vh, 520px)" }}
          role="dialog"
          aria-label="TasteForge assistant"
        >
          <div className="flex items-center justify-between border-b border-violet-500/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-stone-100">
                TasteForge Guide
              </p>
              <p className="text-[10px] text-violet-300/80">
                Live help · wallets, taste, recommendations
                {mode === "llm" ? " · AI" : " · Guide"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-stone-500 transition-colors hover:bg-white/5 hover:text-stone-300"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#f5b942]/20 text-stone-100 ring-1 ring-[#f5b942]/25"
                      : "bg-white/[0.04] text-stone-300 ring-1 ring-white/[0.06]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/[0.04] px-3.5 py-2.5 text-sm text-violet-300">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">·</span>
                    <span className="animate-pulse [animation-delay:150ms]">·</span>
                    <span className="animate-pulse [animation-delay:300ms]">·</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 border-t border-violet-500/15 px-4 py-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="badge-violet px-2.5 py-1 text-[10px] transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            className="border-t border-violet-500/20 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask anything…"
                rows={1}
                disabled={isLoading}
                className="input-brand input-x min-h-[40px] flex-1 resize-none px-3 py-2 text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-cta shrink-0 !px-4 !py-2 !text-xs disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
    </div>
  );
}