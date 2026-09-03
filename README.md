# STRIAÉ — Funil de Vendas

Funil completo: **Anúncio → Quiz → Análise → Chat com IA → Apresentação do STRIAÉ → Oferta 40% OFF → Checkout Pix → Confirmação**.

Escopo explicitamente fora deste projeto (a construir depois): área de membros, app completo, dashboard, videoaulas, biblioteca de conteúdo, sistema de progresso.

## Rodando localmente

```bash
npm install
vercel env pull       # baixa DATABASE_URL (Postgres/Neon) para .env.local
npm run dev
```

Abra http://localhost:3000 — redireciona para `/funil`.

Se ainda não tiver o projeto linkado à Vercel, rode `vercel link` primeiro.
Sem `.env.local`, defina `DATABASE_URL` manualmente (Postgres) e rode
`npx prisma migrate dev` antes do `npm run dev`.

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind v4** — front-end e API routes no mesmo projeto.
- **Prisma + Postgres (Neon, via integração Vercel)** — `QuizSession`, `ChatMessage`, `Order`, `WebhookEvent` (ver `prisma/schema.prisma`). Necessário porque funções serverless da Vercel não têm sistema de arquivos persistente/compartilhado — um banco SQLite local não sobrevive entre invocações.
- **Zustand (persist)** — guarda `quizSessionId`/`orderId` no localStorage do navegador da visitante (sem exigir login).

## Rotas do funil

`/funil` → `/funil/quiz` → `/funil/analise` → `/funil/chat` → `/funil/pagamento/[orderId]` → `/funil/sucesso`

## IA e Pix: mock por padrão

Nenhuma credencial real foi configurada, então o projeto usa provedores **mock** funcionais (não é um protótipo — o fluxo funciona de ponta a ponta):

- **IA** (`src/lib/ai/mockProvider.ts`): conduz a conversa por um roteiro determinístico baseado no perfil do quiz (sem custo, sem API externa). Trocar para a Anthropic real: definir `AI_PROVIDER=anthropic` e `ANTHROPIC_API_KEY` no `.env` — `src/lib/ai/index.ts` troca o provedor automaticamente, sem tocar nas telas.
- **Pix** (`src/lib/payment/mockProvider.ts`): gera QR Code real (escaneável) e código copia-e-cola, mas a transação não é real. Para confirmar o pagamento em desenvolvimento (já que um provedor real não alcança `localhost`), use o botão **"[dev] simular pagamento aprovado"** na tela de pagamento, ou `POST /api/payment/dev-confirm`. Esse endpoint fica bloqueado em produção (ver `src/app/api/payment/dev-confirm/route.ts`).
- Para ligar um provedor Pix real (Mercado Pago, Efí, Asaas...), implemente uma classe em `src/lib/payment/<provider>Provider.ts` seguindo a interface `PixProvider` (`src/lib/payment/provider.ts`) e registre-a em `src/lib/payment/index.ts`.

Toda a configuração de marca/oferta/pagamento/IA fica centralizada em [`src/lib/config.ts`](src/lib/config.ts).

## Segurança do pagamento

- O frontend **nunca** marca um pedido como pago — apenas lê o status (`GET /api/payment/status/[orderId]`).
- Quem muda o status é `POST /api/payment/webhook` (provedor real) ou `POST /api/payment/dev-confirm` (apenas fora de produção), ambos passando por `applyOrderStatusUpdate` (`src/lib/payment/applyStatusUpdate.ts`), que é idempotente — um webhook duplicado não duplica a compra.
- Preço e desconto vêm sempre do servidor (`src/lib/config.ts`), nunca do cliente.

## O que falta antes de produção

- Trocar `AI_PROVIDER`/`PIX_PROVIDER` para valores reais e implementar o provedor Pix escolhido.
- Configurar `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_GTM_ID` para os eventos de tracking (já disparados em todo o funil via `src/lib/tracking.ts`).
- Enviar a foto real da Dra. Anna Christina via `NEXT_PUBLIC_SPECIALIST_PHOTO_URL` (ou `public/images/especialista.jpg`) e as demais imagens em `public/images/` (ver `public/images/README.md`).
