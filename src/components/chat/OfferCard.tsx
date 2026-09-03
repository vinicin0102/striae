import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { offer, formatCentsToBRL } from "@/lib/config";

export function OfferCard({ onSelect, loading }: { onSelect: () => void; loading?: boolean }) {
  return (
    <Card className="p-5 max-w-[90%] animate-fade-in-up border-plum-600/20">
      <span className="inline-block text-xs font-semibold tracking-wide text-plum-700 bg-rose-100 px-3 py-1 rounded-full mb-3">
        CONDIÇÃO ESPECIAL
      </span>

      <p className="font-serif text-2xl text-plum-700 mb-3">{offer.discountPct}% OFF</p>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-ink-300 line-through text-sm">
          {formatCentsToBRL(offer.originalPriceCents)}
        </span>
        <span className="font-serif text-xl text-ink-900">
          {formatCentsToBRL(offer.finalPriceCents)}
        </span>
      </div>

      <ul className="space-y-1.5 my-4">
        {offer.benefits.slice(0, 4).map((b) => (
          <li key={b} className="text-sm text-ink-700 flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">✓</span>
            {b}
          </li>
        ))}
      </ul>

      <Button className="w-full" onClick={onSelect} disabled={loading}>
        {loading ? "PREPARANDO..." : "QUERO ACESSAR O STRIAÉ"}
      </Button>

      <p className="text-xs text-ink-500 text-center mt-3">
        Condição promocional disponível nesta sessão.
      </p>
    </Card>
  );
}
