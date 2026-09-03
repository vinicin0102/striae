export type QuizAnswerType = "single" | "multi";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: "region" | "duration" | "mainConcern" | "previousAttempts" | "interest";
  step: number;
  type: QuizAnswerType;
  question: string;
  options: QuizOption[];
  ctaLabel?: string; // usado na última pergunta (CTA em vez de opções clicáveis simples)
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "region",
    step: 1,
    type: "single",
    question: "Onde as suas estrias mais incomodam você?",
    options: [
      { value: "barriga", label: "Barriga" },
      { value: "gluteos", label: "Glúteos" },
      { value: "coxas", label: "Coxas" },
      { value: "seios", label: "Seios" },
      { value: "bracos", label: "Braços" },
      { value: "quadril", label: "Quadril" },
      { value: "varias", label: "Várias regiões" },
    ],
  },
  {
    id: "duration",
    step: 2,
    type: "single",
    question: "Há quanto tempo você percebe essas estrias?",
    options: [
      { value: "menos_6_meses", label: "Menos de 6 meses" },
      { value: "6_meses_1_ano", label: "6 meses a 1 ano" },
      { value: "1_5_anos", label: "1 a 5 anos" },
      { value: "mais_5_anos", label: "Mais de 5 anos" },
      { value: "nao_sei", label: "Não sei dizer" },
    ],
  },
  {
    id: "mainConcern",
    step: 3,
    type: "single",
    question: "O que mais incomoda você nas suas estrias?",
    options: [
      { value: "aparencia", label: "A aparência" },
      { value: "quantidade", label: "A quantidade" },
      { value: "cor", label: "A cor" },
      { value: "inseguranca_roupas", label: "Fico insegura usando determinadas roupas" },
      { value: "evita_biquini", label: "Evito usar biquíni" },
      { value: "evita_mostrar", label: "Evito mostrar algumas partes do corpo" },
      { value: "ja_tentou_sem_sucesso", label: "Já tentei melhorar e não consegui" },
    ],
  },
  {
    id: "previousAttempts",
    step: 4,
    type: "multi",
    question: "Você já tentou alguma coisa para melhorar a aparência delas?",
    options: [
      { value: "cremes", label: "Cremes" },
      { value: "oleos", label: "Óleos" },
      { value: "tratamentos_esteticos", label: "Tratamentos estéticos" },
      { value: "receitas_caseiras", label: "Receitas caseiras" },
      { value: "produtos_especificos", label: "Produtos específicos" },
      { value: "varias_coisas", label: "Já tentei várias coisas" },
      { value: "nunca_tentei", label: "Nunca tentei nada" },
    ],
  },
  {
    id: "interest",
    step: 5,
    type: "single",
    question:
      "Se existisse uma forma simples de incluir cuidados para suas estrias na sua rotina, você gostaria de conhecer?",
    options: [{ value: "sim", label: "Sim, quero conhecer" }],
    ctaLabel: "SIM, QUERO CONHECER",
  },
];

export const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

// Rótulos legíveis usados na personalização da IA (prompt) e em telemetria.
export const QUIZ_LABELS: Record<string, Record<string, string>> = QUIZ_QUESTIONS.reduce(
  (acc, q) => {
    acc[q.id] = Object.fromEntries(q.options.map((o) => [o.value, o.label]));
    return acc;
  },
  {} as Record<string, Record<string, string>>
);
