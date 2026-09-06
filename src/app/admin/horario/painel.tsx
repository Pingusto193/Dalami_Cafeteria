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

function LinhaDoDia({ inicial }: { inicial: Dia }) {
  // O estado local existe só para apagar os campos de hora quando o dia é
  // marcado como fechado. Sem isso a pessoa vê um horário escrito num dia
  // fechado e fica em dúvida se vale ou não.
  const [fechado, setFechado] = useState(inicial.fechado);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-tinta/8 py-4 last:border-0">
      <span className="w-32 shrink-0 font-medium text-cacau">{NOMES[inicial.dia]}</span>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-tinta-suave">
        <input
          type="checkbox"
          name={`fechado-${inicial.dia}`}
          checked={fechado}
          onChange={(e) => setFechado(e.target.checked)}
          className="size-4 accent-[var(--color-terracota)]"
        />
        Fechado
      </label>

      <div
        className={`flex items-center gap-2 transition-opacity ${
          fechado ? "pointer-events-none opacity-35" : ""
        }`}
      >
        <label className="flex items-center gap-2 text-sm text-tinta-suave">
          abre
          <input
            type="time"
            name={`abre-${inicial.dia}`}
            defaultValue={inicial.abre}
            disabled={fechado}
            className="rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-tinta outline-none focus:border-oliva"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-tinta-suave">
          fecha
          <input
            type="time"
            name={`fecha-${inicial.dia}`}
            defaultValue={inicial.fecha}
            disabled={fechado}
            className="rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-tinta outline-none focus:border-oliva"
          />
        </label>
      </div>
    </div>
  );
}

export function PainelHorario({ dias }: { dias: Dia[] }) {
  const [estado, acao] = useActionState(salvarHorarios, null);

  return (
    <form action={acao} className="max-w-2xl space-y-5">
      <Cartao>
        {dias.map((d) => (
          <LinhaDoDia key={d.dia} inicial={d} />
        ))}
      </Cartao>

      <Aviso resultado={estado} />
      <Salvar>Salvar horários</Salvar>
    </form>
  );
}
