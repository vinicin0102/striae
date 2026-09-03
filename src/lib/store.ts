"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizAnswers } from "@/lib/types";

interface FunnelState {
  quizSessionId: string | null;
  answers: QuizAnswers;
  orderId: string | null;
  hasHydrated: boolean;
  setQuizSessionId: (id: string) => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setOrderId: (id: string) => void;
  setHasHydrated: (v: boolean) => void;
  reset: () => void;
}

// O middleware `persist` só lê o localStorage depois do primeiro render (React
// hidrata em cliente). Telas que decidem redirecionar com base em
// quizSessionId (ex: chat) precisam esperar `hasHydrated` antes de checar —
// senão todo refresh/deep-link bate o valor inicial (null) e redireciona
// incorretamente, mesmo com uma sessão válida salva.
export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      quizSessionId: null,
      answers: {},
      orderId: null,
      hasHydrated: false,
      setQuizSessionId: (id) => set({ quizSessionId: id }),
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      setOrderId: (id) => set({ orderId: id }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      reset: () => set({ quizSessionId: null, answers: {}, orderId: null }),
    }),
    {
      name: "striae-funnel",
      partialize: (state) => ({
        quizSessionId: state.quizSessionId,
        answers: state.answers,
        orderId: state.orderId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
