"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const STORAGE_KEY = "chat_tr_messages_v1";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const clear = useCallback(() => {
    setMessages([]);
    setInput("");
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setIsStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `İstek başarısız: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantAccumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantAccumulated += chunk;
        setMessages((prev) => {
          const hasAssistant = prev[prev.length - 1]?.role === "assistant";
          if (hasAssistant) {
            const clone = prev.slice();
            clone[clone.length - 1] = {
              role: "assistant",
              content: assistantAccumulated,
            };
            return clone;
          }
          return [...prev, { role: "assistant", content: assistantAccumulated }];
        });
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message || "Bilinmeyen hata");
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages]);

  return useMemo(
    () => ({
      messages,
      input,
      setInput,
      isStreaming,
      sendMessage,
      stop,
      clear,
      error,
    }),
    [messages, input, isStreaming, sendMessage, stop, clear, error]
  );
}


