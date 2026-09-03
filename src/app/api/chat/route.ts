import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import type { QuizAnswers, ChatMessageDTO } from "@/lib/types";
import type { ChatMessage } from "@prisma/client";

function toQuizAnswers(session: {
  region: string | null;
  duration: string | null;
  mainConcern: string | null;
  previousAttempts: string | null;
}): QuizAnswers {
  return {
    region: session.region ?? undefined,
    duration: session.duration ?? undefined,
    mainConcern: session.mainConcern ?? undefined,
    previousAttempts: session.previousAttempts
      ? (JSON.parse(session.previousAttempts) as string[])
      : undefined,
  };
}

function toDTO(m: ChatMessage): ChatMessageDTO {
  const meta = m.meta ? JSON.parse(m.meta) : {};
  return {
    id: m.id,
    role: m.role as "assistant" | "user",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    ...meta,
  };
}

export async function GET(req: NextRequest) {
  const quizSessionId = req.nextUrl.searchParams.get("quizSessionId");
  if (!quizSessionId) {
    return NextResponse.json({ error: "quizSessionId é obrigatório" }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { quizSessionId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages: messages.map(toDTO) });
}

export async function POST(req: NextRequest) {
  let body: { quizSessionId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.quizSessionId) {
    return NextResponse.json({ error: "quizSessionId é obrigatório" }, { status: 400 });
  }

  const session = await prisma.quizSession.findUnique({ where: { id: body.quizSessionId } });
  if (!session) {
    return NextResponse.json({ error: "Sessão de quiz não encontrada" }, { status: 404 });
  }

  const priorMessages = await prisma.chatMessage.findMany({
    where: { quizSessionId: body.quizSessionId },
    orderBy: { createdAt: "asc" },
  });

  if (body.message) {
    await prisma.chatMessage.create({
      data: { quizSessionId: body.quizSessionId, role: "user", content: body.message },
    });
  }

  const provider = getAIProvider();
  const reply = await provider.generateReply(
    toQuizAnswers(session),
    priorMessages.map((m) => ({ role: m.role as "assistant" | "user", content: m.content })),
    body.message ?? null
  );

  const meta: Record<string, unknown> = {};
  if (reply.quickReplies) meta.quickReplies = reply.quickReplies;
  if (reply.showProductCard) meta.showProductCard = true;
  if (reply.showOfferCard) meta.showOfferCard = true;

  const saved = await prisma.chatMessage.create({
    data: {
      quizSessionId: body.quizSessionId,
      role: "assistant",
      content: reply.content,
      meta: Object.keys(meta).length ? JSON.stringify(meta) : null,
    },
  });

  return NextResponse.json({ reply: toDTO(saved) });
}
