"use client";

import type { ChatMessageDTO, OrderDTO, QuizAnswers } from "@/lib/types";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status} em ${url}`);
  }
  return res.json();
}

export function saveQuizAnswer(params: {
  quizSessionId: string | null;
  questionId: keyof QuizAnswers;
  value: string | string[];
}) {
  return jsonFetch<{ quizSessionId: string }>("/api/quiz", {
    method: "POST",
    body: JSON.stringify({
      quizSessionId: params.quizSessionId ?? undefined,
      questionId: params.questionId,
      value: params.value,
    }),
  });
}

export function getChatHistory(quizSessionId: string) {
  return jsonFetch<{ messages: ChatMessageDTO[] }>(
    `/api/chat?quizSessionId=${encodeURIComponent(quizSessionId)}`
  );
}

export function sendChatMessage(quizSessionId: string, message: string | null) {
  return jsonFetch<{ reply: ChatMessageDTO }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ quizSessionId, message: message ?? undefined }),
  });
}

export function createOrder(quizSessionId: string | null) {
  return jsonFetch<{ order: OrderDTO }>("/api/payment/create", {
    method: "POST",
    body: JSON.stringify({ quizSessionId: quizSessionId ?? undefined }),
  });
}

export function getOrderStatus(orderId: string) {
  return jsonFetch<{ order: OrderDTO }>(`/api/payment/status/${orderId}`);
}

export function devConfirmPayment(orderId: string) {
  return jsonFetch<{ ok: boolean }>("/api/payment/dev-confirm", {
    method: "POST",
    body: JSON.stringify({ orderId, status: "PAID" }),
  });
}
