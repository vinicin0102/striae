"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS, TOTAL_QUESTIONS } from "@/lib/quiz/questions";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useFunnelStore } from "@/lib/store";
import { saveQuizAnswer } from "@/lib/api";
import { trackEvent } from "@/lib/tracking";
import { AttemptIcon, BodyMapIcon, QuestionThemeBadge } from "@/components/quiz/icons";
import clsx from "clsx";

export function QuizFlow() {
  const router = useRouter();
  const { quizSessionId, setQuizSessionId, setAnswer } = useFunnelStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const question = QUIZ_QUESTIONS[stepIndex];
  const isLast = stepIndex === TOTAL_QUESTIONS - 1;

  async function persistAndAdvance(value: string | string[]) {
    setSaving(true);
    try {
      const { quizSessionId: id } = await saveQuizAnswer({
        quizSessionId,
        questionId: question.id,
        value,
      });
      setQuizSessionId(id);
      setAnswer(question.id, value as never);
      trackEvent("QuizQuestionAnswered", { questionId: question.id, step: question.step });

      if (isLast) {
        trackEvent("QuizCompleted");
        router.push("/funil/analise");
        return;
      }

      setStepIndex((i) => i + 1);
      setMultiSelected([]);
    } finally {
      setSaving(false);
    }
  }

  function handleSingleSelect(value: string) {
    if (saving) return;
    persistAndAdvance(value);
  }

  function toggleMulti(value: string) {
    setMultiSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  return (
    <main className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-sm mx-auto w-full">
      <div className="mb-8">
        <p className="text-xs font-medium text-ink-500 mb-2">
          Pergunta {question.step} de {TOTAL_QUESTIONS}
        </p>
        <ProgressBar value={question.step} max={TOTAL_QUESTIONS} />
      </div>

      <div key={question.id} className="flex-1 flex flex-col animate-fade-in-up">
        <QuestionThemeBadge questionId={question.id} />

        <h2 className="font-serif text-2xl leading-snug text-ink-900 mb-6">
          {question.question}
        </h2>

        {question.type === "single" && !question.ctaLabel && (
          <div className="flex flex-col gap-3">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                disabled={saving}
                onClick={() => handleSingleSelect(opt.value)}
                className="w-full text-left px-4 py-3 rounded-2xl border border-rose-200 bg-base-50 text-ink-900 font-medium hover:border-rose-500 hover:bg-rose-100 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-3"
              >
                {question.id === "region" && <BodyMapIcon region={opt.value} size={36} />}
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {question.type === "multi" && (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {question.options.map((opt) => {
                const active = multiSelected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    disabled={saving}
                    onClick={() => toggleMulti(opt.value)}
                    className={clsx(
                      "w-full text-left px-4 py-3 rounded-2xl border font-medium transition-all active:scale-[0.99] disabled:opacity-60 flex items-center gap-3",
                      active
                        ? "border-rose-500 bg-rose-100 text-plum-700"
                        : "border-rose-200 bg-base-50 text-ink-900 hover:border-rose-500 hover:bg-rose-100"
                    )}
                  >
                    <span className={clsx(!active && "text-ink-500")}>
                      <AttemptIcon value={opt.value} />
                    </span>
                    <span className="flex-1">{opt.label}</span>
                    {active && <CheckDot />}
                  </button>
                );
              })}
            </div>
            <Button
              disabled={multiSelected.length === 0 || saving}
              onClick={() => persistAndAdvance(multiSelected)}
              className="w-full"
            >
              CONTINUAR
            </Button>
          </>
        )}

        {question.ctaLabel && (
          <div className="mt-auto pt-6">
            <Button
              disabled={saving}
              onClick={() => handleSingleSelect(question.options[0].value)}
              className="w-full"
            >
              {question.ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function CheckDot() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-rose-500">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M7 12.5l3 3 7-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
