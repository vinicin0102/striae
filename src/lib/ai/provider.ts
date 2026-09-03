import type { QuizAnswers } from "@/lib/types";

export interface AIHistoryMessage {
  role: "assistant" | "user";
  content: string;
}

export interface AIReply {
  content: string;
  quickReplies?: string[];
  showProductCard?: boolean;
  showOfferCard?: boolean;
}

export interface AIProvider {
  /**
   * Gera a próxima mensagem da assistente virtual.
   * @param quiz respostas do quiz (perfil da usuária)
   * @param history histórico completo da conversa, em ordem cronológica
   * @param userMessage última mensagem enviada pela usuária (texto livre ou quick reply), ou null se for a mensagem de abertura
   */
  generateReply(
    quiz: QuizAnswers,
    history: AIHistoryMessage[],
    userMessage: string | null
  ): Promise<AIReply>;
}
