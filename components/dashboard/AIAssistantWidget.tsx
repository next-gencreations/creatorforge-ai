"use client";

import { useState } from "react";
import { Sparkles, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const STARTER: Message = {
  role: "assistant",
  text: "Hi! I'm your CreatorForge AI assistant. Ask me to brainstorm ideas, review your last video's performance, or draft a title.",
};

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState("");

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      {
        role: "assistant",
        text: "This is a preview build — the assistant isn't wired to a live model yet. Once connected, I'll answer using your channel's real data.",
      },
    ]);
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">AI Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything..."
              className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <button
              onClick={send}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700"
        aria-label="Toggle AI assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    </div>
  );
}
