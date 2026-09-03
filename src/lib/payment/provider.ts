export interface PixCharge {
  pixTxId: string;
  pixCopyPaste: string;
  pixQrCodeDataUrl: string; // data URL (image/png;base64) pronto para <img src>
  expiresAt: Date;
}

export interface CreateChargeInput {
  orderId: string;
  amountCents: number;
  description: string;
}

export interface PixProvider {
  createCharge(input: CreateChargeInput): Promise<PixCharge>;

  /**
   * Valida a autenticidade do webhook recebido (assinatura/segredo do provedor)
   * e extrai o id da transação e o novo status.
   * Deve lançar erro se a assinatura for inválida.
   */
  parseWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<{ pixTxId: string; status: "PAID" | "EXPIRED" | "CANCELLED"; raw: unknown }>;
}
