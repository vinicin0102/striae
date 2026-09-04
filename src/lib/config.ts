// Configuração central da marca, oferta, pagamento e IA.
// Ajuste aqui (ou via variáveis de ambiente) sem tocar na lógica do funil.

export const brand = {
  name: "STRIAÉ",
  fullName: "STRIAÉ — Skin Renewal System",
  tagline: "Sua pele. Sua rotina. Seu cuidado.",
  specialist: {
    name: "Dra. Anna Christina",
    role: "Médica",
    // Caminho da foto real, enviada pelo administrador (ver public/images/README.md).
    // Se o arquivo não existir ainda, os componentes que usam isso (Avatar) caem
    // de volta num avatar ilustrado — nunca numa imagem fictícia apresentada como real.
    photoUrl: process.env.NEXT_PUBLIC_SPECIALIST_PHOTO_URL || "/doutora.jpg",
  },
};

export const offer = {
  productName: "STRIAÉ — Skin Renewal System",
  originalPriceCents: 19700, // R$ 197,00
  discountPct: 40,
  get finalPriceCents() {
    return Math.round(this.originalPriceCents * (1 - this.discountPct / 100));
  },
  benefits: [
    "Rotinas de cuidados personalizadas",
    "Técnicas de aplicação e massagem",
    "Videoaulas passo a passo",
    "Exercícios complementares",
    "Receitas e preparações",
    "Conteúdos sobre produtos e ativos",
    "Suporte da Dra. sempre disponível",
    "Acompanhamento da sua rotina",
  ],
};

export const payment = {
  provider: process.env.PIX_PROVIDER || "mock",
  env: process.env.PIX_ENV || "sandbox",
  expirationMinutes: Number(process.env.PIX_EXPIRATION_MINUTES || 30),
};

export const ai = {
  provider: process.env.AI_PROVIDER || "mock",
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
  temperature: 0.7,
};

export const tracking = {
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
};

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
