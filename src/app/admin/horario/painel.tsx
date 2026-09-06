"use client";

import { useActionState, useState } from "react";
import { Aviso, Cartao, Salvar } from "../componentes";
import { salvarHorarios } from "../acoes-conteudo";

const NOMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

type Dia = { dia: number; fechado: boolean; abre: string; fecha: string };

export function PainelHorario({ dias }: { dias: Dia[] }) {
  const [estado, acao] = useActionState(salvarHorarios, null);

  /**
   * Os campos são controlados por este estado, e não pelo próprio navegador,
   * porque o botão de repetir precisa conseguir preencher os outros dias. Com
   * campos soltos daria para mexer no DOM na mão, mas aí a tela e o que está
   * na memória passariam a discordar.
   */
  const [linhas, setLinhas] = useState<Dia[]>(dias);
  const [copiado, setCopiado] = useState<number | null>(null);

  function mudar(dia: number, mudanca: Partial<Dia>) {
    setLinhas((atual) => atual.map((l) => (l.dia === dia ? { ...l, ...mudanca } : l)));
  }

  /**
   * Copia o horário de um dia para todos os outros.
   *
   * NÃO mexe em quem está marcado como fechado: a segunda costuma ser folga, e
   * repetir o horário de terça em cima dela reabriria a loja sem ninguém pedir.
   */
  function repetirEmTodos(origem: Dia) {
    setLinhas((atual) =>
      atual.map((l) =>
        l.fechado ? l : { ...l, abre: origem.abre, fecha: origem.fecha },
      ),
    );
    setCopiado(origem.dia);
    setTimeout(() => setCopiado(null), 2500);
  }

  return (
    <form action={acao} className="max-w-2xl space-y-5">
      <Cartao>
        {linhas.map((d) => (
          <div
            key={d.dia}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-tinta/8 py-4 last:border-0"
          >
            <span className="w-32 shrink-0 font-medium text-cacau">{NOMES[d.dia]}</span>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-tinta-suave">
              <input
                type="checkbox"
                name={`fechado-${d.dia}`}
                checked={d.fechado}
                onChange={(e) => mudar(d.dia, { fechado: e.target.checked })}
                className="size-4 accent-[var(--color-terracota)]"
              />
              Fechado
            </label>

            <div
              className={`flex items-center gap-2 transition-opacity ${
                d.fechado ? "pointer-events-none opacity-35" : ""
              }`}
            >
              <label className="flex items-center gap-2 text-sm text-tinta-suave">
                abre
                <input
                  type="time"
                  name={`abre-${d.dia}`}
                  value={d.abre}
                  onChange={(e) => mudar(d.dia, { abre: e.target.value })}
                  disabled={d.fechado}
                  className="rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-tinta outline-none focus:border-oliva"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-tinta-suave">
                fecha
                <input
                  type="time"
                  name={`fecha-${d.dia}`}
                  value={d.fecha}
                  onChange={(e) => mudar(d.dia, { fecha: e.target.value })}
                  disabled={d.fechado}
                  className="rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-tinta outline-none focus:border-oliva"
                />
              </label>
            </div>

            {!d.fechado && (
              <button
                type="button"
                onClick={() => repetirEmTodos(d)}
                title="Copia este horário para todos os dias que não estão fechados"
                className="btn ml-auto rounded-full px-3 py-1.5 text-[0.68rem] text-tinta-tenue transition-colors hover:bg-cacau/5 hover:text-cacau"
              >
                {copiado === d.dia ? "Copiado" : "Repetir em todos"}
              </button>
            )}
          </div>
        ))}
      </Cartao>

      <p className="text-xs text-tinta-tenue">
        Use &quot;Repetir em todos&quot; para dar o mesmo horário a todos os dias de
        uma vez. Os dias marcados como fechados não são alterados.
      </p>

      <Aviso resultado={estado} />
      <Salvar>Salvar horários</Salvar>
    </form>
  );
}
