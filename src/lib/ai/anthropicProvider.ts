import type { AIHistoryMessage, AIProvider, AIReply } from "./provider";
import { buildSystemPrompt } from "./prompt";
import { ai as aiConfig } from "@/lib/config";
import type { QuizAnswers } from "@/lib/types";

/**
 * Provedor real via API da Anthropic. Só é instanciado quando
 * ANTHROPIC_API_KEY está configurada (ver ./index.ts). Mantém o mesmo
 * contrato (AIProvider) do provedor mock, então trocar entre eles é
 * apenas uma questão de configuração (AI_PROVIDER=anthropic).
 */
export class AnthropicAIProvider implements AIProvider {
  constructor(private apiKey: string) {}

  async generateReply(
    quiz: QuizAnswers,
    history: AIHistoryMessage[],
    userMessage: string | null
  ): Promise<AIReply> {
    const system = buildSystemPrompt(quiz);
    const messages = [...history];
    if (userMessage) messages.push({ role: "user", content: userMessage });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: aiConfig.model,
        max_tokens: 300,
        temperature: aiConfig.temperature,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    const content: string =
      data?.content?.map((block: { text?: string }) => block.text ?? "").join("") ?? "";

    return { content: content.trim() };
  }
}
