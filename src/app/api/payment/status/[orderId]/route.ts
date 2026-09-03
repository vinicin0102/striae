import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { OrderDTO } from "@/lib/types";

// Consulta de status somente-leitura. O frontend nunca pode alterar o status
// por aqui — apenas ler o que o backend/provedor já confirmou.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await ctx.params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  // Expira automaticamente na leitura, se o tempo já passou e ainda está pendente.
  if (order.status === "PENDING" && order.expiresAt && order.expiresAt < new Date()) {
    const expired = await prisma.order.update({
      where: { id: order.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ order: toDTO(expired) });
  }

  return NextResponse.json({ order: toDTO(order) });
}

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
