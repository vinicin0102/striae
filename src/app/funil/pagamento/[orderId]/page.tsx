"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getOrderStatus, devConfirmPayment } from "@/lib/api";
import { formatCentsToBRL } from "@/lib/config";
import { trackEvent } from "@/lib/tracking";
import type { OrderDTO } from "@/lib/types";

const POLL_MS = 3000;

export default function PagamentoPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const approvedTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const { order: fresh } = await getOrderStatus(orderId);
        if (cancelled) return;
        setOrder(fresh);

        if (fresh.status === "PAID") {
          if (!approvedTracked.current) {
            approvedTracked.current = true;
            trackEvent("PaymentApproved", { orderId });
          }
          router.push("/funil/sucesso");
          return;
        }

        if (fresh.status === "PENDING") {
          timer = setTimeout(poll, POLL_MS);
        }
      } catch {
        timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, router]);

  if (!order) {
    return (
      <main className="flex-1 flex items-center justify-center text-ink-500 text-sm">
        Carregando pagamento...
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 max-w-sm mx-auto w-full">
      <h1 className="font-serif text-2xl text-ink-900 mb-1 text-center">Finalize seu acesso</h1>
      <p className="text-sm text-ink-500 mb-6 text-center">{order.productName}</p>

      <Card className="w-full p-5 mb-6">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-ink-500">Preço original</span>
          <span className="text-sm text-ink-300 line-through">
            {formatCentsToBRL(order.originalPriceCents)}
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-ink-500">Desconto</span>
          <span className="text-sm text-rose-600 font-medium">{order.discountPct}% OFF</span>
        </div>
        <div className="flex items-baseline justify-between pt-3 mt-2 border-t border-rose-100">
          <span className="font-medium text-ink-900">Total</span>
          <span className="font-serif text-2xl text-plum-700">
            {formatCentsToBRL(order.finalPriceCents)}
          </span>
        </div>
      </Card>

      {order.status === "EXPIRED" ? (
        <ExpiredState />
      ) : (
        <>
          <p className="text-sm font-medium text-ink-900 mb-1">Pague com Pix</p>
          <p className="text-xs text-ink-500 mb-5 text-center">
            Escaneie o QR Code ou copie o código abaixo.
          </p>

          {order.pixQrCodeDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.pixQrCodeDataUrl}
              alt="QR Code Pix"
              className="w-56 h-56 mb-5 rounded-2xl border border-rose-100 bg-white p-3"
            />
          )}

          <Button
            variant="secondary"
            className="w-full mb-4"
            onClick={async () => {
              if (!order.pixCopyPaste) return;
              await navigator.clipboard.writeText(order.pixCopyPaste);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "CÓDIGO COPIADO ✓" : "COPIAR CÓDIGO PIX"}
          </Button>

          <div className="flex items-center gap-2 text-ink-500 text-sm mb-1">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-rose-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            Aguardando confirmação do pagamento...
          </div>

          {process.env.NODE_ENV !== "production" && (
            <button
              disabled={simulating}
              onClick={async () => {
                setSimulating(true);
                try {
                  await devConfirmPayment(orderId);
                } finally {
                  setSimulating(false);
                }
              }}
              className="mt-8 text-xs text-ink-300 underline underline-offset-2 hover:text-ink-500"
            >
              [dev] simular pagamento aprovado
            </button>
          )}
        </>
      )}
    </main>
  );
}

function ExpiredState() {
  return (
    <div className="text-center">
      <p className="text-plum-700 font-medium mb-2">Este código Pix expirou.</p>
      <p className="text-sm text-ink-500 mb-6">Volte à conversa para gerar um novo pagamento.</p>
    </div>
  );
}
