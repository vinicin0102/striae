import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPixProvider } from "@/lib/payment";
import { offer } from "@/lib/config";
import type { OrderDTO } from "@/lib/types";

function toDTO(order: {
  id: string;
  status: string;
  productName: string;
  originalPrice: number;
  finalPrice: number;
  discountPct: number;
  pixCopyPaste: string | null;
  pixQrCodeUrl: string | null;
  expiresAt: Date | null;
}): OrderDTO {
  return {
    id: order.id,
    status: order.status as OrderDTO["status"],
    productName: order.productName,
    originalPriceCents: order.originalPrice,
    finalPriceCents: order.finalPrice,
    discountPct: order.discountPct,
    pixCopyPaste: order.pixCopyPaste,
    pixQrCodeDataUrl: order.pixQrCodeUrl,
    expiresAt: order.expiresAt ? order.expiresAt.toISOString() : null,
  };
}

// Cria um pedido + cobrança Pix. O preço vem exclusivamente da configuração do
// servidor (src/lib/config.ts) — nunca é aceito valor enviado pelo cliente.
export async function POST(req: NextRequest) {
  let body: { quizSessionId?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (body.quizSessionId) {
    const session = await prisma.quizSession.findUnique({ where: { id: body.quizSessionId } });
    if (!session) {
      return NextResponse.json({ error: "Sessão de quiz não encontrada" }, { status: 404 });
    }
  }

  const order = await prisma.order.create({
    data: {
      quizSessionId: body.quizSessionId ?? null,
      productName: offer.productName,
      originalPrice: offer.originalPriceCents,
      finalPrice: offer.finalPriceCents,
      discountPct: offer.discountPct,
      status: "PENDING",
    },
  });

  try {
    const provider = getPixProvider();
    const charge = await provider.createCharge({
      orderId: order.id,
      amountCents: offer.finalPriceCents,
      description: offer.productName,
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        pixTxId: charge.pixTxId,
        pixCopyPaste: charge.pixCopyPaste,
        pixQrCodeUrl: charge.pixQrCodeDataUrl,
        expiresAt: charge.expiresAt,
      },
    });

    return NextResponse.json({ order: toDTO(updated) });
  } catch (err) {
    console.error("[payment/create] falha ao gerar cobrança Pix", err);
    return NextResponse.json({ error: "Não foi possível gerar a cobrança Pix" }, { status: 502 });
  }
}
