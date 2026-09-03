"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/config";
import { trackEvent } from "@/lib/tracking";
import { useFunnelStore } from "@/lib/store";

export default function SucessoPage() {
  const orderId = useFunnelStore((s) => s.orderId);

  useEffect(() => {
    trackEvent("Purchase", { orderId: orderId ?? undefined });
  }, [orderId]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm mx-auto animate-fade-in-up">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-3xl">🎉</span>
        </div>

        <h1 className="font-serif text-2xl text-ink-900 mb-2">Pagamento confirmado!</h1>
        <p className="text-ink-700 mb-8">
          Seu acesso ao {brand.name} está sendo preparado.
        </p>

        {/* A área de membros ainda será desenvolvida — este botão prepara o
            redirecionamento futuro sem quebrar o fluxo hoje. */}
        <Button className="w-full" disabled>
          ACESSAR O STRIAÉ
        </Button>
        <p className="text-xs text-ink-300 mt-3">
          Você receberá as instruções de acesso em instantes.
        </p>
      </div>
    </main>
  );
}
