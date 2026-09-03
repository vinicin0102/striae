import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyOrderStatusUpdate } from "@/lib/payment/applyStatusUpdate";
import { payment } from "@/lib/config";

// Simulador de webhook, só para desenvolvimento/teste local, onde o provedor
// Pix real não consegue alcançar localhost. Reaproveita exatamente a mesma
// função de atualização de status usada pelo webhook real — o frontend
// continua sem poder marcar um pedido como pago diretamente.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && payment.provider !== "mock") {
    return NextResponse.json({ error: "Indisponível em produção" }, { status: 403 });
  }

  let body: { orderId?: string; status?: "PAID" | "EXPIRED" | "CANCELLED" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.orderId) {
    return NextResponse.json({ error: "orderId é obrigatório" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order || !order.pixTxId) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const status = body.status ?? "PAID";

  try {
    const updated = await applyOrderStatusUpdate({
      pixTxId: order.pixTxId,
      status,
      provider: "mock-dev-confirm",
      raw: { simulated: true, status },
    });
    return NextResponse.json({ ok: true, order: { id: updated.id, status: updated.status } });
  } catch (err) {
    console.error("[payment/dev-confirm]", err);
    return NextResponse.json({ error: "Falha ao simular confirmação" }, { status: 500 });
  }
}
