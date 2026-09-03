import QRCode from "qrcode";
import { nanoid } from "nanoid";
import type { CreateChargeInput, PixCharge, PixProvider } from "./provider";
import { payment } from "@/lib/config";

/**
 * Provedor Pix mock — usado enquanto nenhuma credencial real (Mercado Pago,
 * Efí, Asaas, etc.) está configurada. Gera uma cobrança simulada, mas com
 * QR Code real (escaneável) e um código "copia e cola" no formato Pix.
 *
 * A confirmação de pagamento NUNCA vem do frontend: em desenvolvimento ela é
 * simulada via POST /api/payment/dev-confirm, que internamente chama o mesmo
 * caminho de código do webhook real (ver /api/payment/webhook).
 */
export class MockPixProvider implements PixProvider {
  async createCharge(input: CreateChargeInput): Promise<PixCharge> {
    const pixTxId = `mock_${nanoid(16)}`;
    const amount = (input.amountCents / 100).toFixed(2);

    // Payload no formato "copia e cola" (BR Code / EMV) simplificado — suficiente
    // para gerar um QR Code válido e visualmente correto em ambiente de teste.
    const pixCopyPaste = buildFakeEmvPayload({
      txId: pixTxId,
      amount,
      description: input.description,
    });

    const pixQrCodeDataUrl = await QRCode.toDataURL(pixCopyPaste, {
      margin: 1,
      width: 320,
      color: { dark: "#3d2b2b", light: "#ffffff00" },
    });

    const expiresAt = new Date(Date.now() + payment.expirationMinutes * 60_000);

    return { pixTxId, pixCopyPaste, pixQrCodeDataUrl, expiresAt };
  }

  async parseWebhook(rawBody: string, headers: Headers) {
    const secret = process.env.PIX_WEBHOOK_SECRET;
    if (secret) {
      const provided = headers.get("x-webhook-secret");
      if (provided !== secret) {
        throw new Error("Assinatura de webhook inválida");
      }
    }

    const body = JSON.parse(rawBody) as { pixTxId?: string; status?: string };
    if (!body.pixTxId || !body.status) {
      throw new Error("Payload de webhook inválido: pixTxId e status são obrigatórios");
    }
    if (!["PAID", "EXPIRED", "CANCELLED"].includes(body.status)) {
      throw new Error(`Status de webhook desconhecido: ${body.status}`);
    }

    return {
      pixTxId: body.pixTxId,
      status: body.status as "PAID" | "EXPIRED" | "CANCELLED",
      raw: body,
    };
  }
}

function buildFakeEmvPayload(opts: { txId: string; amount: string; description: string }) {
  // Não é um payload EMV oficial (não deve ser usado para pagamentos reais) —
  // apenas plausível o suficiente para testar a experiência de QR Code/copia-e-cola.
  return [
    "00020126",
    "STRIAE.MOCK.PIX",
    `TXID:${opts.txId}`,
    `VALOR:${opts.amount}`,
    `DESC:${opts.description.slice(0, 40)}`,
    "5204000053039865802BR5913STRIAE6009SAOPAULO",
    "6304MOCK",
  ].join("");
}
