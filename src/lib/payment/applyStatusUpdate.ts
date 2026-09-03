import { prisma } from "@/lib/db";

interface StatusUpdateInput {
  pixTxId: string;
  status: "PAID" | "EXPIRED" | "CANCELLED";
  provider: string;
  raw: unknown;
}

/**
 * Único ponto que efetivamente muda o status de um pedido a partir de uma
 * confirmação de pagamento. Usado tanto pelo webhook real quanto pelo
 * simulador de desenvolvimento — nunca pelo frontend diretamente.
 *
 * Idempotente: um webhook duplicado para uma transação já paga não gera
 * efeitos colaterais nem duplica a "compra".
 */
export async function applyOrderStatusUpdate(input: StatusUpdateInput) {
  const order = await prisma.order.findUnique({ where: { pixTxId: input.pixTxId } });

  if (!order) {
    await prisma.webhookEvent.create({
      data: {
        provider: input.provider,
        pixTxId: input.pixTxId,
        payload: JSON.stringify(input.raw),
        processedOk: false,
      },
    });
    throw new Error(`Pedido não encontrado para pixTxId=${input.pixTxId}`);
  }

  // Idempotência: já processamos esse estado antes, não faz nada além de registrar o evento.
  const alreadyFinal = order.status !== "PENDING";
  if (alreadyFinal) {
    await prisma.webhookEvent.create({
      data: {
        provider: input.provider,
        pixTxId: input.pixTxId,
        payload: JSON.stringify(input.raw),
        processedOk: true,
      },
    });
    return order;
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: input.status,
      paidAt: input.status === "PAID" ? new Date() : order.paidAt,
      providerRaw: JSON.stringify(input.raw),
    },
  });

  await prisma.webhookEvent.create({
    data: {
      provider: input.provider,
      pixTxId: input.pixTxId,
      payload: JSON.stringify(input.raw),
      processedOk: true,
    },
  });

  return updated;
}
