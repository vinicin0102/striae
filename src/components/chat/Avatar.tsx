"use client";

import { brand } from "@/lib/config";
import { useImageExists } from "@/lib/useImageExists";

export function SpecialistAvatar({ size = 40 }: { size?: number }) {
  const photo = brand.specialist.photoUrl;
  const photoExists = useImageExists(photo);

  if (photo && photoExists) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={brand.specialist.name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return <IllustratedAvatar size={size} />;
}

/**
 * Avatar ilustrado (não fotográfico) usado enquanto a foto real da
 * especialista não é configurada. Deliberadamente estilizado — um busto
 * abstrato, não uma tentativa de retrato realista — para nunca sugerir que
 * é uma foto de verdade de uma pessoa real.
 */
function IllustratedAvatar({ size }: { size: number }) {
  const id = "specialist-avatar-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-rose-400)" />
          <stop offset="100%" stopColor="var(--color-plum-600)" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${id})`} />
      {/* busto abstrato */}
      <circle cx="20" cy="16.5" r="6.2" fill="var(--color-base-50)" opacity="0.92" />
      <path
        d="M8 34c0-7 5.4-11.5 12-11.5S32 27 32 34"
        fill="var(--color-base-50)"
        opacity="0.92"
      />
      {/* flor estilizada, referência ao "renewal" da marca */}
      <g opacity="0.85">
        <circle cx="28.5" cy="27.5" r="1.6" fill="var(--color-gold-400)" />
        <circle cx="31" cy="29.5" r="1.6" fill="var(--color-gold-400)" />
        <circle cx="26.3" cy="29.8" r="1.6" fill="var(--color-gold-400)" />
      </g>
    </svg>
  );
}
