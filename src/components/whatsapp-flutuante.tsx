"use client";

import { useEffect, useState } from "react";

/**
 * Botão de WhatsApp fixo no canto da tela.
 *
 * Duas decisões que valem registro:
 *
 * 1. Ele NÃO aparece de cara. Surge depois que a pessoa rola um pouco, porque
 *    um botão saltando sobre o hero no primeiro segundo atrapalha justamente o
 *    momento em que ela está decidindo se fica.
 *
 * 2. Fica no canto ESQUERDO. O direito já é do botão que leva ao painel, e
 *    dois botões flutuantes no mesmo canto viram um só borrão.
 */
export function WhatsAppFlutuante({ href }: { href: string }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 600);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Dalami no WhatsApp"
      className="btn fixed bottom-5 left-5 z-40 flex items-center gap-2.5 rounded-full bg-[#25D366] py-3.5 pr-5 pl-4 font-medium text-white shadow-lg shadow-cacau/25 transition-all duration-500 hover:scale-[1.03]"
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "translateY(0)" : "translateY(1rem)",
        pointerEvents: visivel ? "auto" : "none",
      }}
    >
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
      <span className="hidden text-sm sm:inline">Falar no WhatsApp</span>
    </a>
  );
}
