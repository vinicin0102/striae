"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/config";
import { trackEvent } from "@/lib/tracking";
import { useFunnelStore } from "@/lib/store";
import { useImageExists } from "@/lib/useImageExists";

const HERO_SRC = "/images/hero.jpg";

export default function FunnelEntryPage() {
  const reset = useFunnelStore((s) => s.reset);
  const hasHero = useImageExists(HERO_SRC);

  useEffect(() => {
    trackEvent("PageView", { page: "funil_entry" });
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-rose-100 via-base-50 to-base-50">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center animate-fade-in-up">
        <span className="font-serif text-2xl tracking-[0.2em] text-plum-700 mb-1">
          {brand.name}
        </span>
        <span className="text-xs tracking-[0.15em] text-ink-500 uppercase mb-6">
          {brand.tagline}
        </span>

        {hasHero && (
          // eslint-disable-next-line @next/next/no-img-element -- caminho local em public/images/
          <img
            src={HERO_SRC}
            alt=""
            className="w-full aspect-[4/5] object-cover rounded-[1.5rem] shadow-[var(--shadow-soft)] mb-8"
          />
        )}

        <h1 className="font-serif text-3xl leading-tight text-ink-900 mb-4">
          Descubra o que pode estar por trás das suas estrias
        </h1>

        <p className="text-ink-700 text-base leading-relaxed mb-8">
          Responda algumas perguntas rápidas e descubra uma estratégia
          personalizada para sua rotina de cuidados.
        </p>

        <div className="flex items-center gap-2 text-rose-600 text-sm font-medium mb-10">
          <CheckIcon />
          Leva menos de 1 minuto
        </div>

        <Link
          href="/funil/quiz"
          className="w-full"
          onClick={() => {
            reset();
            trackEvent("QuizStarted");
          }}
        >
          <Button className="w-full">COMEÇAR AGORA</Button>
        </Link>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.15" />
      <path
        d="M7 12.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
