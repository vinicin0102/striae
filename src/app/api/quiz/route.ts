import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_FIELDS = ["region", "duration", "mainConcern", "previousAttempts", "interest"] as const;
type Field = (typeof VALID_FIELDS)[number];

interface QuizAnswerBody {
  quizSessionId?: string;
  questionId: Field;
  value: string | string[];
  utm?: { source?: string; medium?: string; campaign?: string };
}

// Salva uma resposta do quiz por vez (chamado a cada pergunta respondida),
// criando a sessão na primeira resposta. Reduz fricção: nada de nome/telefone/e-mail aqui.
export async function POST(req: NextRequest) {
  let body: QuizAnswerBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.questionId || !VALID_FIELDS.includes(body.questionId)) {
    return NextResponse.json({ error: "questionId inválido" }, { status: 400 });
  }

  const data: Record<string, string> = {
    [body.questionId]: Array.isArray(body.value) ? JSON.stringify(body.value) : body.value,
  };

  if (body.utm?.source) data.utmSource = body.utm.source;
  if (body.utm?.medium) data.utmMedium = body.utm.medium;
  if (body.utm?.campaign) data.utmCampaign = body.utm.campaign;

  try {
    if (body.quizSessionId) {
      const session = await prisma.quizSession.update({
        where: { id: body.quizSessionId },
        data,
      });
      return NextResponse.json({ quizSessionId: session.id });
    }

    const session = await prisma.quizSession.create({ data });
    return NextResponse.json({ quizSessionId: session.id });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar a resposta" }, { status: 500 });
  }
}
