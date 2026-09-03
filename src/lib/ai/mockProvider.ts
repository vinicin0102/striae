import type { AIHistoryMessage, AIProvider, AIReply } from "./provider";
import { QUIZ_LABELS } from "@/lib/quiz/questions";
import { brand } from "@/lib/config";
import type { QuizAnswers } from "@/lib/types";

function label(field: string, value?: string | null) {
  if (!value) return null;
  return QUIZ_LABELS[field]?.[value] ?? value;
}

const GENERIC_ACK = [
  "Entendi. ❤️ Obrigada por compartilhar isso comigo.",
  "Faz total sentido, obrigada por me contar.",
  "Entendi como você se sente, isso é mais comum do que parece.",
];

function pickAck(seed: number) {
  return GENERIC_ACK[seed % GENERIC_ACK.length];
}

/**
 * Provedor mock: conduz a conversa por um roteiro determinístico baseado
 * no perfil do quiz, sem depender de nenhuma API externa. Usado como
 * padrão em desenvolvimento (AI_PROVIDER=mock) e como fallback caso a
 * chave da IA real não esteja configurada.
 */
export class MockAIProvider implements AIProvider {
  async generateReply(
    quiz: QuizAnswers,
    history: AIHistoryMessage[],
    // O roteiro do mock avança por contagem de turnos, não pelo conteúdo digitado
    // livremente — só o provedor real (Anthropic) de fato lê o texto da usuária.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userMessage: string | null
  ): Promise<AIReply> {
    const assistantTurns = history.filter((m) => m.role === "assistant").length;

    // Turno 0: mensagem de abertura, personalizada com o quiz.
    if (assistantTurns === 0) {
      return this.opening(quiz);
    }

    // Turno 1 -> usuária acabou de confirmar que quer responder perguntas.
    if (assistantTurns === 1) {
      return {
        content: "Você sente que isso afeta sua confiança no dia a dia?",
        quickReplies: ["Sim, bastante", "Um pouco", "Não muito"],
      };
    }

    if (assistantTurns === 2) {
      return {
        content: "Entendo. Você costuma usar algum produto atualmente para cuidar da pele nessas regiões?",
        quickReplies: ["Sim", "Não", "Uso alguns"],
      };
    }

    if (assistantTurns === 3) {
      return {
        content: "O que você mais gostaria de conseguir mudar na aparência da sua pele?",
        quickReplies: [
          "Reduzir a aparência das estrias",
          "Ter uma pele mais uniforme",
          "Recuperar minha confiança",
        ],
      };
    }

    if (assistantTurns === 4) {
      const region = label("region", quiz.region) ?? "essa região";
      return {
        content: `Pelo que você me contou, acho que o mais importante pra você é ter uma rotina simples e organizada para cuidar da pele na região ${region.toLowerCase()}, sem precisar ficar procurando informações diferentes ou testando produtos aleatórios.\n\nFoi justamente pensando nisso que criamos o ${brand.name}.`,
        showProductCard: true,
        quickReplies: ["QUERO CONHECER"],
      };
    }

    if (assistantTurns === 5) {
      return {
        content:
          "E como você acabou de passar pela nossa avaliação, tenho uma condição especial disponível para você nesta sessão. 🎁",
        showOfferCard: true,
      };
    }

    // Depois da oferta: qualquer nova mensagem só reforça, sem inventar conteúdo novo.
    const ack = pickAck(assistantTurns);
    return {
      content: `${ack} Você pode conferir todos os detalhes da condição especial que preparei pra você logo acima. 💛`,
    };
  }

  private opening(quiz: QuizAnswers): AIReply {
    const region = label("region", quiz.region);
    const duration = label("duration", quiz.duration);
    const attempts = quiz.previousAttempts ?? [];
    const firstAttempt = attempts.length ? label("previousAttempts", attempts[0]) : null;

    const parts: string[] = [`Olá! 😊 Vi suas respostas`];

    if (region && duration) {
      parts.push(
        `e entendi que as estrias na região ${region.toLowerCase()} são algo que incomoda você há ${duration.toLowerCase()}.`
      );
    } else if (region) {
      parts.push(`e entendi que as estrias na região ${region.toLowerCase()} incomodam bastante você.`);
    } else {
      parts.push("e entendi um pouco sobre o que você está sentindo em relação às suas estrias.");
    }

    if (firstAttempt) {
      parts.push(`Também percebi que você já tentou ${firstAttempt.toLowerCase()}.`);
    }

    const greeting = parts.join(" ");
    const followUp =
      "Quero entender um pouquinho melhor sua rotina para ver quais conteúdos podem fazer mais sentido para você.\n\nPosso te fazer algumas perguntas rápidas?";

    return {
      content: `${greeting}\n\n${followUp}`,
      quickReplies: ["SIM, PODE PERGUNTAR"],
    };
  }
}
