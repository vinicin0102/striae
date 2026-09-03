import { ai as aiConfig } from "@/lib/config";
import { MockAIProvider } from "./mockProvider";
import { AnthropicAIProvider } from "./anthropicProvider";
import type { AIProvider } from "./provider";

export type { AIProvider, AIReply, AIHistoryMessage } from "./provider";

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (aiConfig.provider === "anthropic" && apiKey) {
    cached = new AnthropicAIProvider(apiKey);
  } else {
    // Sem credenciais configuradas: cai no mock automaticamente.
    cached = new MockAIProvider();
  }
  return cached;
}
