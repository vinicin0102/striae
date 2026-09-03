"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SpecialistAvatar } from "./Avatar";
import { ProductCard } from "./ProductCard";
import { OfferCard } from "./OfferCard";
import { brand } from "@/lib/config";
import { useFunnelStore } from "@/lib/store";
import { createOrder, getChatHistory, sendChatMessage } from "@/lib/api";
import { trackEvent } from "@/lib/tracking";
import type { ChatMessageDTO } from "@/lib/types";
import clsx from "clsx";

function typingDelay() {
  return 700 + Math.random() * 700;
}

export function ChatWindow() {
  const router = useRouter();
  const { quizSessionId, setOrderId, hasHydrated } = useFunnelStore();

  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const engagedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasHydrated) return; // aguarda o zustand ler o localStorage antes de decidir

    if (!quizSessionId) {
      router.replace("/funil");
      return;
    }

    trackEvent("ChatStarted");

    (async () => {
      const { messages: history } = await getChatHistory(quizSessionId);
      if (history.length > 0) {
        setMessages(history);
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(false);
      setTyping(true);
      await wait(typingDelay());
      const { reply } = await sendChatMessage(quizSessionId, null);
      setTyping(false);
      setMessages([reply]);
    })();
  }, [quizSessionId, hasHydrated, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.showOfferCard) trackEvent("OfferViewed");
  }, [messages]);

  async function handleSend(content: string) {
    if (!quizSessionId || !content.trim() || typing) return;

    if (!engagedRef.current) {
      engagedRef.current = true;
      trackEvent("ChatEngaged");
    }

    const optimisticUser: ChatMessageDTO = {
      id: `local_${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);
    setInput("");
    setTyping(true);

    await wait(typingDelay());
    try {
      const { reply } = await sendChatMessage(quizSessionId, content);
      setMessages((m) => [...m, reply]);
    } finally {
      setTyping(false);
    }
  }

  async function handleGoToCheckout() {
    if (!quizSessionId || offerLoading) return;
    setOfferLoading(true);
    trackEvent("CheckoutStarted");
    try {
      const { order } = await createOrder(quizSessionId);
      setOrderId(order.id);
      trackEvent("PixGenerated", { orderId: order.id });
      router.push(`/funil/pagamento/${order.id}`);
    } finally {
      setOfferLoading(false);
    }
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const showQuickReplies =
    !typing && lastAssistant && lastAssistant.id === messages[messages.length - 1]?.id
      ? lastAssistant.quickReplies
      : undefined;

  return (
    <div className="flex-1 flex flex-col h-dvh max-h-dvh">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loadingHistory && (
          <div className="flex-1 flex items-center justify-center text-ink-500 text-sm">
            Carregando conversa...
          </div>
        )}

        {messages.map((m) => (
          <MessageGroup key={m.id} message={m} />
        ))}

        {typing && <TypingIndicator />}

        {showQuickReplies && showQuickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {showQuickReplies.map((qr) => (
              <button
                key={qr}
                onClick={() => handleSend(qr)}
                className="px-4 py-2 rounded-full border border-rose-400 text-plum-700 text-sm font-medium bg-base-50 hover:bg-rose-100 transition-colors"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInputBar
        value={input}
        onChange={setInput}
        onSubmit={() => handleSend(input)}
        disabled={typing || loadingHistory}
      />
    </div>
  );

  function MessageGroup({ message }: { message: ChatMessageDTO }) {
    return (
      <div className="flex flex-col gap-2">
        <MessageBubble message={message} />
        {message.showProductCard && (
          <div className="pl-11">
            <ProductCard />
          </div>
        )}
        {message.showOfferCard && (
          <div className="pl-11">
            <OfferCard onSelect={handleGoToCheckout} loading={offerLoading} />
          </div>
        )}
      </div>
    );
  }
}

function ChatHeader() {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-rose-100 bg-base-50/95 backdrop-blur sticky top-0 z-10">
      <div className="relative">
        <SpecialistAvatar size={40} />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-base-50" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-serif text-base text-ink-900">{brand.specialist.name}</span>
        <span className="text-xs text-ink-500">{brand.specialist.role} · online</span>
      </div>
    </header>
  );
}

function MessageBubble({ message }: { message: ChatMessageDTO }) {
  const isAssistant = message.role === "assistant";
  return (
    <div className={clsx("flex items-end gap-2", !isAssistant && "flex-row-reverse")}>
      {isAssistant && <SpecialistAvatar size={28} />}
      <div
        className={clsx(
          "max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line animate-fade-in-up",
          isAssistant
            ? "bg-base-100 text-ink-900 rounded-bl-sm"
            : "bg-plum-700 text-base-50 rounded-br-sm"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <SpecialistAvatar size={28} />
      <div className="bg-base-100 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1">
        <span className="text-xs text-ink-500 mr-1">{brand.specialist.name.split(" ")[0]} está digitando</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-300"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatInputBar({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2 px-4 py-3 border-t border-rose-100 bg-base-50"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escreva sua mensagem..."
        disabled={disabled}
        className="flex-1 rounded-full border border-rose-200 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-rose-500 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-10 w-10 shrink-0 rounded-full bg-plum-700 text-base-50 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
        aria-label="Enviar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12L20 4L13 20L11 13L4 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
