import { NextRequest, NextResponse } from "next/server";
import { getPixProvider } from "@/lib/payment";
import { applyOrderStatusUpdate } from "@/lib/payment/applyStatusUpdate";
import { payment } from "@/lib/config";

// Endpoint que recebe a confirmação de pagamento do provedor Pix.
// Nunca confia em nada vindo do navegador — apenas em requisições do provedor,
// validadas por assinatura/segredo (ver PixProvider.parseWebhook).
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  try {
    const provider = getPixProvider();
    const { pixTxId, status, raw } = await provider.parseWebhook(rawBody, req.headers);

    await applyOrderStatusUpdate({ pixTxId, status, provider: payment.provider, raw });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[payment/webhook] falha ao processar webhook", err);
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }
}
