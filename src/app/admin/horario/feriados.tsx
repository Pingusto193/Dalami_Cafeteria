"use client";

import { useActionState, useState } from "react";
import { Aviso, Campo, Cartao, Excluir, Recolhivel, Salvar } from "../componentes";
import { apagarFeriado, salvarFeriado } from "../acoes-conteudo";

export type Feriado = {
  id: string;
  data: string; // "AAAA-MM-DD"
  fechado: boolean;
  abre: string;
  fecha: string;
  motivo: string;
};

/** Mostra a data como o brasileiro lê, não como o banco guarda. */
function comoSeLe(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function Formulario({ aoFechar }: { aoFechar: () => void }) {
  const [estado, acao] = useActionState(salvarFeriado, null);
  const [fechado, setFechado] = useState(true);

  return (
    <form action={acao} className="space-y-4 rounded-xl border border-tinta/12 bg-creme p-4">
      <Campo nome="data" rotulo="Dia" tipo="date" obrigatorio />

      <Campo
        nome="motivo"
        rotulo="Motivo"
        placeholder="Natal, folga, reforma..."
        dica="Aparece no site quando alguém olha o horário nesse dia."
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-tinta">
        <input
          type="checkbox"
          name="fechado"
          checked={fechado}
          onChange={(e) => setFechado(e.target.checked)}
          className="size-4 accent-[var(--color-terracota)]"
        />
        Fechado o dia inteiro
      </label>

      {/* Só aparece quando o dia NÃO está fechado. Mostrar campo de hora num
          dia fechado faz a pessoa preencher à toa e depois duvidar se valeu. */}
      <Recolhivel aberto={!fechado}>
        <div className="flex flex-wrap items-end gap-3 pt-1">
          <label className="flex items-center gap-2 text-sm text-tinta-suave">
            abre
            <input
              type="time"
              name="abre"
              defaultValue="08:00"
              className="rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-tinta outline-none focus:border-oliva"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-tinta-suave">
            fecha
            <input
              type="time"
              name="fecha"
              defaultValue="13:00"
              className="rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-tinta outline-none focus:border-oliva"
            />
          </label>
        </div>
      </Recolhivel>

      <Aviso resultado={estado} />

      <div className="flex items-center gap-3">
        <Salvar>Marcar dia</Salvar>
        <button
          type="button"
          onClick={aoFechar}
          className="btn rounded-full px-4 py-2 text-sm text-tinta-tenue hover:text-cacau"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/**
 * Feriados e fechamentos pontuais.
 *
 * Sem isto, para fechar no Natal o dono teria que mexer no horário da semana e
 * lembrar de desfazer depois. Aqui ele marca o dia, e o site trata sozinho: no
 * dia marcado, o "aberto agora" respeita esta data em vez do horário normal.
 */
export function Feriados({ feriados }: { feriados: Feriado[] }) {
  const [criando, setCriando] = useState(false);
  const [apagado, acaoApagar] = useActionState(apagarFeriado, null);

  const hoje = new Date().toISOString().slice(0, 10);
  const futuros = feriados.filter((f) => f.data >= hoje);
  const passados = feriados.filter((f) => f.data < hoje);

  return (
    <Cartao>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-cacau">
            Feriados e dias diferentes
          </h2>
          <p className="mt-1 text-sm text-tinta-suave">
            Marque um dia específico sem mexer no horário da semana. No dia
            marcado, o site avisa sozinho que a loja está fechada.
          </p>
        </div>
        {!criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="btn rounded-full border border-cacau/20 px-4 py-2 text-xs font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
          >
            Marcar um dia
          </button>
        )}
      </div>

      <Aviso resultado={apagado} />

      <Recolhivel aberto={criando} className="mt-5">
        <Formulario aoFechar={() => setCriando(false)} />
      </Recolhivel>

      {feriados.length === 0 ? (
        <p className="mt-5 text-sm text-tinta-tenue">
          Nenhum dia marcado. O site segue o horário normal da semana.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {futuros.length > 0 && (
            <ul className="space-y-2">
              {futuros.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-cacau">
                      {comoSeLe(f.data)}
                      {f.motivo ? ` · ${f.motivo}` : ""}
                    </p>
                    <p className="text-xs text-tinta-tenue">
                      {f.fechado ? "Fechado o dia inteiro" : `Abre ${f.abre} e fecha ${f.fecha}`}
                    </p>
                  </div>
                  <form action={acaoApagar}>
                    <input type="hidden" name="id" value={f.id} />
                    <Excluir />
                  </form>
                </li>
              ))}
            </ul>
          )}

          {passados.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-tinta-tenue hover:text-cacau">
                {passados.length} {passados.length === 1 ? "dia que já passou" : "dias que já passaram"}
              </summary>
              <ul className="mt-3 space-y-2">
                {passados.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-tinta/8 p-3 opacity-60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-tinta-suave">
                        {comoSeLe(f.data)}
                        {f.motivo ? ` · ${f.motivo}` : ""}
                      </p>
                    </div>
                    <form action={acaoApagar}>
                      <input type="hidden" name="id" value={f.id} />
                      <Excluir />
                    </form>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </Cartao>
  );
}
