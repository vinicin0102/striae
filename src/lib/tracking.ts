"use client";

export const TRACKING_EVENTS = {
  PageView: "PageView",
  QuizStarted: "QuizStarted",
  QuizQuestionAnswered: "QuizQuestionAnswered",
  QuizCompleted: "QuizCompleted",
  AnalysisViewed: "AnalysisViewed",
  ChatStarted: "ChatStarted",
  ChatEngaged: "ChatEngaged",
  OfferViewed: "OfferViewed",
  CheckoutStarted: "CheckoutStarted",
  PixGenerated: "PixGenerated",
  PaymentApproved: "PaymentApproved",
  Purchase: "Purchase",
} as const;

export type TrackingEventName = keyof typeof TRACKING_EVENTS;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Ponto único de disparo de eventos do funil. Hoje envia para o console em
 * desenvolvimento; quando Meta Pixel / GA4 / GTM forem configurados
 * (ver src/lib/config.ts -> tracking), os disparos reais entram aqui sem
 * precisar tocar nas telas que chamam trackEvent(...).
 */
export function trackEvent(name: TrackingEventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    console.debug(`[tracking] ${name}`, params);
  }

  window.fbq?.("trackCustom", name, params);
  window.gtag?.("event", name, params);
  window.dataLayer?.push({ event: name, ...params });
}
