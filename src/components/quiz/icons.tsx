import type { QuizQuestion } from "@/lib/quiz/questions";

/**
 * Silhueta única e abstrata (não anatômica, não fotográfica) reaproveitada em
 * todo o "mapa do corpo" do quiz — só a região destacada muda por opção.
 */
function Silhouette() {
  return (
    <>
      <circle cx="30" cy="12" r="9" fill="var(--color-rose-200)" />
      <rect x="18" y="24" width="24" height="38" rx="12" fill="var(--color-rose-200)" />
      <rect x="16" y="56" width="28" height="18" rx="10" fill="var(--color-rose-200)" />
      <rect x="6" y="26" width="9" height="40" rx="4.5" fill="var(--color-rose-200)" />
      <rect x="45" y="26" width="9" height="40" rx="4.5" fill="var(--color-rose-200)" />
      <rect x="19" y="72" width="10" height="50" rx="5" fill="var(--color-rose-200)" />
      <rect x="31" y="72" width="10" height="50" rx="5" fill="var(--color-rose-200)" />
    </>
  );
}

const REGION_HIGHLIGHTS: Record<string, React.ReactNode> = {
  barriga: <ellipse cx="30" cy="46" rx="10" ry="10" fill="var(--color-plum-600)" />,
  seios: (
    <>
      <ellipse cx="24" cy="32" rx="6" ry="6" fill="var(--color-plum-600)" />
      <ellipse cx="36" cy="32" rx="6" ry="6" fill="var(--color-plum-600)" />
    </>
  ),
  quadril: <ellipse cx="30" cy="65" rx="17" ry="10" fill="var(--color-plum-600)" />,
  gluteos: <ellipse cx="30" cy="72" rx="15" ry="9" fill="var(--color-plum-600)" />,
  coxas: (
    <>
      <ellipse cx="24.5" cy="92" rx="7" ry="18" fill="var(--color-plum-600)" />
      <ellipse cx="35.5" cy="92" rx="7" ry="18" fill="var(--color-plum-600)" />
    </>
  ),
  bracos: (
    <>
      <ellipse cx="10.5" cy="46" rx="6.5" ry="20" fill="var(--color-plum-600)" />
      <ellipse cx="49.5" cy="46" rx="6.5" ry="20" fill="var(--color-plum-600)" />
    </>
  ),
  varias: (
    <>
      <ellipse cx="30" cy="46" rx="6" ry="6" fill="var(--color-plum-600)" opacity="0.85" />
      <ellipse cx="30" cy="65" rx="8" ry="5" fill="var(--color-plum-600)" opacity="0.85" />
      <ellipse cx="24.5" cy="92" rx="4.5" ry="10" fill="var(--color-plum-600)" opacity="0.85" />
      <ellipse cx="10.5" cy="46" rx="4" ry="12" fill="var(--color-plum-600)" opacity="0.85" />
      <ellipse cx="24" cy="32" rx="4" ry="4" fill="var(--color-plum-600)" opacity="0.85" />
    </>
  ),
};

export function BodyMapIcon({ region, size = 44 }: { region: string; size?: number }) {
  return (
    <svg width={size} height={(size * 130) / 60} viewBox="0 0 60 130" className="shrink-0">
      <Silhouette />
      {REGION_HIGHLIGHTS[region]}
    </svg>
  );
}

function IconShell({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

const ATTEMPT_ICONS: Record<string, React.ReactNode> = {
  cremes: (
    <IconShell>
      <rect x="6" y="9" width="12" height="11" rx="2" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      <path d="M9 14h6" />
    </IconShell>
  ),
  oleos: (
    <IconShell>
      <path d="M12 3c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11z" />
    </IconShell>
  ),
  tratamentos_esteticos: (
    <IconShell>
      <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </IconShell>
  ),
  receitas_caseiras: (
    <IconShell>
      <path d="M12 21c4-3 7-6.5 7-10.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-7 5.5C5 14.5 8 18 12 21z" />
      <path d="M12 12V5" />
    </IconShell>
  ),
  produtos_especificos: (
    <IconShell>
      <rect x="8" y="7" width="8" height="14" rx="2" />
      <path d="M10 7V5a2 2 0 0 1 4 0v2" />
      <path d="M8 12h8" />
    </IconShell>
  ),
  varias_coisas: (
    <IconShell>
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
      <rect x="9" y="4" width="6" height="6" rx="1.2" />
    </IconShell>
  ),
  nunca_tentei: (
    <IconShell>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 9l6 6" />
    </IconShell>
  ),
};

export function AttemptIcon({ value }: { value: string }) {
  return ATTEMPT_ICONS[value] ?? null;
}

const QUESTION_THEME_ICONS: Record<QuizQuestion["id"], React.ReactNode> = {
  region: (
    <IconShell>
      <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconShell>
  ),
  duration: (
    <IconShell>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconShell>
  ),
  mainConcern: (
    <IconShell>
      <path d="M12 20.5s-7.5-4.8-9.8-9.6C.8 7.2 2.9 3.5 6.5 3.5c2 0 3.6 1.1 4.4 2.5.9.9 1.6-2.5 5.6-2.5 3.6 0 5.7 3.7 4.3 7.4-2.3 4.8-9.8 9.6-9.8 9.6z" />
    </IconShell>
  ),
  previousAttempts: ATTEMPT_ICONS.cremes,
  interest: (
    <IconShell>
      <path d="M12 3l2 5.5L19.5 10 15 13l1 6-4-3.2L8 19l1-6-4.5-3L10 8.5z" />
    </IconShell>
  ),
};

export function QuestionThemeBadge({ questionId }: { questionId: QuizQuestion["id"] }) {
  return (
    <div className="h-11 w-11 rounded-full bg-rose-100 text-plum-700 flex items-center justify-center mb-4">
      {QUESTION_THEME_ICONS[questionId]}
    </div>
  );
}
