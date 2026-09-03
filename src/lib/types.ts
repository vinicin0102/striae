export interface QuizAnswers {
  region?: string;
  duration?: string;
  mainConcern?: string;
  previousAttempts?: string[]; // múltipla seleção
  interest?: string;
}

export interface ChatMessageDTO {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
  quickReplies?: string[];
  showProductCard?: boolean;
  showOfferCard?: boolean;
}

export type OrderStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";

export interface OrderDTO {
  id: string;
  status: OrderStatus;
  productName: string;
  originalPriceCents: number;
  finalPriceCents: number;
  discountPct: number;
  pixCopyPaste: string | null;
  pixQrCodeDataUrl: string | null;
  expiresAt: string | null;
}
