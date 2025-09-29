"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/lib/useChat";

// TASK_ID:CHAT-TR-001 (UI kabuğu)

export default function ChatWidget() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    messages,
    input,
    setInput,
    isStreaming,
    sendMessage,
    stop,
    clear,
    error,
  } = useChat();

  const [isTyping, setIsTyping] = useState(false);

  const isSendDisabled = useMemo(() => {
    return input.trim().length === 0 || isStreaming;
  }, [input, isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        160,
        Math.max(40, textareaRef.current.scrollHeight)
      )}px`;
    }
  }, [input, isStreaming]);

  // Basit "Asistan yazıyor" göstergesi: streaming sırasında animasyon
  useEffect(() => {
    setIsTyping(isStreaming);
  }, [isStreaming]);

  return (
    <div className="w-full max-w-2xl mx-auto h-[calc(100vh-8rem)] sm:h-auto flex flex-col">
      <div className="border rounded-2xl p-3 sm:p-5 bg-white/80 dark:bg-black/30 backdrop-blur shadow-sm flex-1 flex flex-col min-h-0">
        <div
          className="space-y-3 flex-1 overflow-auto pr-2 min-h-0"
          aria-live="polite"
          aria-busy={isStreaming}
          role="log"
        >
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}-${m.content.length}`}
              className={
                m.role === "user"
                  ? "text-left"
                  : m.role === "assistant"
                  ? "text-left"
                  : "sr-only"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-2xl px-3 py-2 bg-white shadow-sm border"
                    : "inline-block rounded-2xl px-3 py-2 bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-indigo-900/30 dark:to-pink-900/20 border border-indigo-100/50"
                }
              >
                <span className="block text-xs font-medium text-gray-500 mb-1">
                  {m.role === "user" ? "Sen" : "Asistan"}
                </span>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-indigo-900/30 dark:to-pink-900/20 border border-indigo-100/50">
                <span className="block text-xs font-medium text-gray-500">Asistan</span>
                <span className="inline-flex items-center gap-1" aria-live="polite">
                  <span className="w-1.5 h-1.5 bg-gray-500/70 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-500/70 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-500/70 rounded-full animate-bounce [animation-delay:0.2s]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <form
          className="mt-4 flex items-end gap-2 sticky-action-bar flex-shrink-0"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSendDisabled) {
              void sendMessage();
            }
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Mesajını yaz
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="flex-1 resize-none rounded-md border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base bg-white/90 dark:bg-gray-900/60 min-h-[3rem]"
            placeholder="Kısaca durumunu yaz; birlikte nazikçe düşünelim…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            rows={2}
            aria-disabled={isStreaming}
          />

          <div className="flex gap-2 flex-shrink-0">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 text-white text-base font-medium px-4 py-3 disabled:opacity-50 shadow hover:bg-indigo-700 transition-colors min-h-[3rem]"
              disabled={isSendDisabled}
            >
              Gönder
            </button>

            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="rounded-md border text-base font-medium px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[3rem]"
              >
                Durdur
              </button>
            ) : (
              <button
                type="button"
                onClick={clear}
                className="rounded-md border text-base font-medium px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[3rem]"
              >
                Temizle
              </button>
            )}
          </div>
        </form>

        <p className="mt-3 text-xs text-gray-500">
          Not: Bu asistan genel bilgi amaçlıdır; tıbbi/psikolojik/tüzel teşhis vermez. Gerekli
          durumlarda lütfen bir uzmana başvur.
        </p>
      </div>
    </div>
  );
}


