"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/config";
import { trackEvent } from "@/lib/tracking";
import { useFunnelStore } from "@/lib/store";

const STAGES = [
  "Analisando suas respostas...",
  "Encontramos alguns pontos importantes sobre o seu perfil.",
  `Agora vamos conversar com a ${brand.specialist.name} para entender melhor sua rotina.`,
];

export default function AnalysisPage() {
  const [stage, setStage] = useState(0);
  const quizSessionId = useFunnelStore((s) => s.quizSessionId);

  useEffect(() => {
    trackEvent("AnalysisViewed");
  }, []);

  useEffect(() => {
    if (stage >= STAGES.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [stage]);

  const isFinal = stage === STAGES.length - 1;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
        {!isFinal && (
          <div className="flex gap-1.5 mb-8" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="typing-dot h-2.5 w-2.5 rounded-full bg-rose-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        <p key={stage} className="font-serif text-xl leading-relaxed text-ink-900 animate-fade-in-up">
          {STAGES[stage]}
        </p>

        {isFinal && (
          <Link href="/funil/chat" className="w-full mt-10">
            <Button className="w-full" disabled={!quizSessionId}>
              CONTINUAR
            </Button>
          </Link>
        )}
      </div>
    </main>
  );
}
