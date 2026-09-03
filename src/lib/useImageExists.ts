"use client";

import { useEffect, useState } from "react";

/**
 * Verifica se uma imagem carrega com sucesso, via uma sondagem client-only
 * (não pelo onError do <img> renderizado na tela).
 *
 * Por quê: numa página SSR, o navegador pode terminar de carregar (ou falhar)
 * a imagem do HTML vindo do servidor ANTES do React hidratar e anexar o
 * listener de onError — em localhost um 404 responde quase instantaneamente,
 * então o evento se perde e o <img> quebrado fica preso na tela para sempre.
 * Sondar com uma Image() à parte, só depois do mount, evita essa corrida.
 */
export function useImageExists(src: string | null) {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setExists(true);
    };
    probe.onerror = () => {
      if (!cancelled) setExists(false);
    };
    probe.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return exists;
}
