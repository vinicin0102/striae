import { payment as paymentConfig } from "@/lib/config";
import { MockPixProvider } from "./mockProvider";
import type { PixProvider } from "./provider";

export type { PixProvider, PixCharge, CreateChargeInput } from "./provider";

let cached: PixProvider | null = null;

export function getPixProvider(): PixProvider {
  if (cached) return cached;

  switch (paymentConfig.provider) {
    case "mock":
      cached = new MockPixProvider();
      break;
    default:
      // Estrutura pronta para os demais provedores (Mercado Pago, Efí, Asaas, ...).
      // Implemente a classe correspondente em ./<provider>Provider.ts seguindo a
      // interface PixProvider assim que as credenciais reais estiverem disponíveis,
      // e registre-a aqui. Até lá, caímos no mock para não travar o funil.
      console.warn(
        `[payment] Provedor "${paymentConfig.provider}" ainda não implementado — usando mock.`
      );
      cached = new MockPixProvider();
  }

  return cached;
}
