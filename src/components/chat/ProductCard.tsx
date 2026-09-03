"use client";

import { Card } from "@/components/ui/Card";
import { brand, offer } from "@/lib/config";
import { useImageExists } from "@/lib/useImageExists";

const MOCKUP_SRC = "/images/produto-mockup.jpg";

export function ProductCard() {
  const hasMockup = useImageExists(MOCKUP_SRC);

  return (
    <Card className="p-5 max-w-[85%] animate-fade-in-up">
      <div className="rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 h-32 mb-4 flex items-center justify-center overflow-hidden">
        {hasMockup ? (
          // eslint-disable-next-line @next/next/no-img-element -- caminho local em public/images/
          <img src={MOCKUP_SRC} alt={brand.fullName} className="h-full w-full object-cover" />
        ) : (
          <span className="font-serif text-lg tracking-[0.15em] text-plum-700">
            {brand.name}
          </span>
        )}
      </div>
      <p className="font-serif text-lg text-ink-900 leading-tight">{brand.name}</p>
      <p className="text-sm text-ink-500 mb-1">Skin Renewal System</p>
      <p className="text-sm text-ink-700 mb-4">
        Uma experiência completa para organizar sua rotina de cuidados com a
        aparência das estrias.
      </p>
      <ul className="space-y-1.5 mb-1">
        {offer.benefits.map((b) => (
          <li key={b} className="text-sm text-ink-700 flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">✓</span>
            {b}
          </li>
        ))}
      </ul>
    </Card>
  );
}
