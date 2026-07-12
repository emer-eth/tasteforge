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
  /** Result-aware suggested questions (override defaults when present). */
  suggestions?: string[];
  /** When set (and open), auto-sends this question once. */
  seedQuestion?: string | null;
  onSeedConsumed?: () => void;
}

export function TasteAssistant({
  context,
  open: controlledOpen,
  onOpenChange,
  suggestions,
  seedQuestion,
  onSeedConsumed,
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

  const lastSeed = useRef<string | null>(null);
  useEffect(() => {
    if (!seedQuestion) {
      lastSeed.current = null;
      return;
    }
    if (open && lastSeed.current !== seedQuestion) {
      lastSeed.current = seedQuestion;
      void sendMessage(seedQuestion);
      onSeedConsumed?.();
    }
  }, [open, seedQuestion, sendMessage, onSeedConsumed]);

  const chips = suggestions?.length ? suggestions : SUGGESTED_QUESTIONS;

  if (!open) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-violet-500/40 sm:bottom-6 sm:right-6 lg:bottom-6"
      style={{
        maxHeight: "min(70vh, 520px)",
        /* Fully opaque — no glass/backdrop so chat is always readable */
        background: "#1a1524",
        boxShadow:
          "0 0 0 1px rgba(155, 142, 196, 0.15) inset, 0 28px 80px -12px rgba(0, 0, 0, 0.85), 0 12px 40px rgba(124, 58, 237, 0.25)",
      }}
      role="dialog"
      aria-label="TasteForge assistant"
    >
      <div
        className="flex shrink-0 items-center justify-between border-b border-violet-500/30 px-4 py-3"
        style={{ background: "#211a2e" }}
      >
        <div>
          <p className="text-sm font-semibold text-[#f5f3ee]">TasteForge Guide</p>
          <p className="text-[10px] text-violet-300">
            Live help · wallets, taste, recommendations
            {mode === "llm" ? " · AI" : " · Guide"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-2 py-1 text-[var(--ink-2)] transition-colors hover:bg-white/10 hover:text-[#f5f3ee]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
        style={{ background: "#1a1524" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#d8b56b] text-[#15120d] ring-1 ring-[#e8cf8e]/40"
                  : "bg-[#2a2238] text-[#f5f3ee] ring-1 ring-violet-400/20"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-[#2a2238] px-3.5 py-2.5 text-sm text-violet-300 ring-1 ring-violet-400/20">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">·</span>
                <span className="animate-pulse [animation-delay:150ms]">
                  ·
                </span>
                <span className="animate-pulse [animation-delay:300ms]">
                  ·
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div
          className="flex shrink-0 flex-wrap gap-1.5 border-t border-violet-500/25 px-4 py-2"
          style={{ background: "#1e1830" }}
        >
          {chips.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="rounded-full border border-violet-400/35 bg-[#2a2238] px-2.5 py-1 text-[10px] text-violet-200 transition-colors hover:border-violet-300/50 hover:bg-[#352a48] disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="shrink-0 border-t border-violet-500/30 p-3"
        style={{ background: "#211a2e" }}
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
            className="min-h-[40px] flex-1 resize-none rounded-xl border border-white/15 bg-[#15120d] px-3 py-2 text-sm text-[#f5f3ee] placeholder:text-[var(--ink-3)] focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
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