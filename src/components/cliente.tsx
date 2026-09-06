"use client";

import { useEffect, useRef, useState } from "react";
import { estadoDaLoja, nomeDoDia, type Periodo, type Excecao } from "@/lib/horario";

/* ===========================================================================
   REVELA

   Entrada coreografada. O IntersectionObserver põe .dentro, e depois que a
   transição termina põe .assentada, que aposenta os atrasos de escalonamento.
   Sem isso, todo hover nos irmãos posteriores herda o atraso para sempre.
   =========================================================================== */

export function Revela({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul";
}) {
  const ref = useRef<HTMLElement>(null);
  const [dentro, setDentro] = useState(false);
  const [assentada, setAssentada] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDentro(true);
      setAssentada(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setDentro(true);
          obs.disconnect();
          // Depois da entrada mais longa (0.7s) somada ao maior escalonamento.
          setTimeout(() => setAssentada(true), 1200);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Componente = Tag as React.ElementType;
  return (
    <Componente
      ref={ref}
      className={`revela ${dentro ? "dentro" : ""} ${assentada ? "assentada" : ""} ${className}`}
    >
      {children}
    </Componente>
  );
}

/* ===========================================================================
   FITA DOURADA (o elemento assinatura)

   Toda encomenda da Dalami sai da loja com uma fita dourada amarrada e um
   medalhão com a assinatura. A fita é a marca, então ela atravessa o site:
   uma linha que se desenha sozinha conforme a pessoa rola.

   Só transform e opacity não bastam aqui, mas stroke-dashoffset roda no
   compositor da mesma forma e não força layout.
   =========================================================================== */

export function FitaDourada({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [tracado, setTracado] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTracado(1);
      return;
    }

    let ticking = false;
    let ultimo = -1;

    function medir() {
      ticking = false;
      const el = ref.current;
      if (!el) return;

      const caixa = el.getBoundingClientRect();
      const alturaJanela = window.innerHeight;
      // 0 quando o topo do elemento entra por baixo, 1 quando ele sobe um terço da tela.
      const bruto = (alturaJanela - caixa.top) / (alturaJanela * 0.75);
      const valor = Math.min(1, Math.max(0, bruto));

      // Escreve só na mudança real, arredondado, para não tocar o DOM por quadro.
      const arredondado = Math.round(valor * 100) / 100;
      if (arredondado !== ultimo) {
        ultimo = arredondado;
        setTracado(arredondado);
      }
    }

    function aoRolar() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(medir);
      }
    }

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <svg
      ref={ref}
      className={className}
      viewBox="0 0 1200 60"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 30 C 150 30, 180 6, 300 6 S 450 54, 600 54 S 750 6, 900 6 S 1050 30, 1200 30"
        stroke="var(--color-dourado)"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - tracado}
        opacity={0.55}
      />
    </svg>
  );
}

/* ===========================================================================
   STATUS DO HORÁRIO

   Calculado no navegador, de propósito. A página é estática e em cache, então
   um "ABERTO agora" renderizado no servidor congelaria: às 22h o site ainda
   diria que a loja está aberta. Aqui ele recalcula a cada minuto, sempre certo.

   Antes da hidratação mostra a grade de horários, que é verdadeira em qualquer
   momento e não depende do relógio.
   =========================================================================== */

export function StatusHorario({
  periodos,
  excecoes,
}: {
  periodos: Periodo[];
  excecoes: Excecao[];
}) {
  const [estado, setEstado] = useState<ReturnType<typeof estadoDaLoja> | null>(null);

  useEffect(() => {
    const atualizar = () => setEstado(estadoDaLoja(periodos, excecoes, new Date()));
    atualizar();
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, [periodos, excecoes]);

  if (!estado) {
    return (
      <span className="font-rotulo text-xs tracking-widest text-tinta-tenue uppercase">
        Ver horários
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-2">
      <span
        className="font-rotulo text-xs uppercase tracking-widest"
        style={{ color: estado.aberto ? "var(--color-oliva)" : "var(--color-terracota)" }}
      >
        <span
          aria-hidden="true"
          className="mr-2 inline-block size-2 rounded-full align-middle"
          style={{
            backgroundColor: estado.aberto ? "var(--color-oliva)" : "var(--color-terracota)",
          }}
        />
        {estado.aberto ? "Aberto agora" : "Fechado agora"}
      </span>
      <span className="text-sm text-tinta-suave">
        {estado.aberto
          ? `até ${estado.fechaAs}`
          : estado.motivo
            ? estado.motivo
            : estado.abreAs
              ? `abre ${estado.diaQueAbre ? `${estado.diaQueAbre} ` : ""}às ${estado.abreAs}`
              : ""}
      </span>
    </span>
  );
}

/* ===========================================================================
   GRADE DE HORÁRIOS
   =========================================================================== */

export function GradeHorarios({ periodos }: { periodos: Periodo[] }) {
  const porDia = new Map<number, Periodo[]>();
  for (const p of periodos) {
    if (!porDia.has(p.dayOfWeek)) porDia.set(p.dayOfWeek, []);
    porDia.get(p.dayOfWeek)!.push(p);
  }

  return (
    <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {[1, 2, 3, 4, 5, 6, 0].map((dia) => {
        const lista = porDia.get(dia) ?? [];
        const fechado = lista.length === 0 || lista.every((p) => p.closed);
        return (
          <div key={dia} className="flex items-baseline justify-between gap-4 border-b border-tinta/8 pb-2">
            <dt className="capitalize text-tinta-suave">{nomeDoDia(dia)}</dt>
            <dd className={fechado ? "text-tinta-tenue" : "font-medium text-tinta"}>
              {fechado
                ? "Fechado"
                : lista
                    .filter((p) => !p.closed)
                    .map((p) => `${p.opensAt} às ${p.closesAt}`)
                    .join(" e ")}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/* ===========================================================================
   PAUSA ANIMAÇÕES EM ABA ESCONDIDA
   =========================================================================== */

export function PausaEmAbaEscondida() {
  useEffect(() => {
    const aoTrocar = () => {
      document.body.classList.toggle("pausado", document.hidden);
    };
    document.addEventListener("visibilitychange", aoTrocar);
    return () => document.removeEventListener("visibilitychange", aoTrocar);
  }, []);

  return null;
}
