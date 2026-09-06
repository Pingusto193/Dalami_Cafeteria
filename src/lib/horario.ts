/**
 * Cálculo de "aberto agora" no fuso da loja.
 *
 * Duas armadilhas que este arquivo existe para evitar:
 *
 * 1. O servidor pode rodar em qualquer fuso (o Render roda em UTC). Se o
 *    cálculo usar o relógio do servidor, a loja "abre" três horas cedo.
 *    Por isso todo horário é lido em America/Sao_Paulo, explicitamente.
 *
 * 2. A resposta muda com o tempo, então ela NÃO pode ser congelada numa
 *    página estática. Quem chama isto no navegador recalcula de verdade.
 */

export const FUSO_LOJA = "America/Sao_Paulo";

export type Periodo = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
};

export type Excecao = {
  data: string; // "AAAA-MM-DD"
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
  label: string | null;
};

export type EstadoLoja =
  | { aberto: true; fechaAs: string }
  | { aberto: false; abreAs: string; diaQueAbre: string | null; motivo: string | null };

const DIAS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/** Lê o relógio no fuso da loja, sem depender do fuso da máquina. */
function agoraNaLoja(referencia: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_LOJA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(referencia);

  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  const mapaDia: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  // "24" aparece à meia-noite em alguns ambientes; normalizamos para 0.
  const hora = get("hour") === "24" ? "00" : get("hour");

  return {
    data: `${get("year")}-${get("month")}-${get("day")}`,
    diaSemana: mapaDia[get("weekday")] ?? 0,
    minutos: Number(hora) * 60 + Number(get("minute")),
  };
}

function paraMinutos(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function estadoDaLoja(
  periodos: Periodo[],
  excecoes: Excecao[],
  referencia: Date,
): EstadoLoja {
  const agora = agoraNaLoja(referencia);

  // Uma exceção do dia (feriado) sobrepõe o horário semanal.
  const excecaoHoje = excecoes.find((e) => e.data === agora.data);

  if (excecaoHoje) {
    if (excecaoHoje.closed || !excecaoHoje.opensAt || !excecaoHoje.closesAt) {
      return {
        aberto: false,
        abreAs: proximaAbertura(periodos, excecoes, agora),
        diaQueAbre: null,
        motivo: excecaoHoje.label,
      };
    }
    const dentro =
      agora.minutos >= paraMinutos(excecaoHoje.opensAt) &&
      agora.minutos < paraMinutos(excecaoHoje.closesAt);
    return dentro
      ? { aberto: true, fechaAs: excecaoHoje.closesAt }
      : {
          aberto: false,
          abreAs: proximaAbertura(periodos, excecoes, agora),
          diaQueAbre: null,
          motivo: excecaoHoje.label,
        };
  }

  const doDia = periodos
    .filter((p) => p.dayOfWeek === agora.diaSemana && !p.closed && p.opensAt && p.closesAt)
    .sort((a, b) => paraMinutos(a.opensAt!) - paraMinutos(b.opensAt!));

  for (const p of doDia) {
    if (agora.minutos >= paraMinutos(p.opensAt!) && agora.minutos < paraMinutos(p.closesAt!)) {
      return { aberto: true, fechaAs: p.closesAt! };
    }
  }

  return {
    aberto: false,
    abreAs: proximaAbertura(periodos, excecoes, agora),
    diaQueAbre: nomeDoProximoDia(periodos, agora),
    motivo: null,
  };
}

function proximaAbertura(
  periodos: Periodo[],
  _excecoes: Excecao[],
  agora: { diaSemana: number; minutos: number },
): string {
  // Ainda hoje?
  const restantesHoje = periodos
    .filter((p) => p.dayOfWeek === agora.diaSemana && !p.closed && p.opensAt)
    .map((p) => p.opensAt!)
    .filter((h) => paraMinutos(h) > agora.minutos)
    .sort();

  if (restantesHoje.length > 0) return restantesHoje[0];

  // Procura nos próximos sete dias.
  for (let i = 1; i <= 7; i++) {
    const dia = (agora.diaSemana + i) % 7;
    const abre = periodos
      .filter((p) => p.dayOfWeek === dia && !p.closed && p.opensAt)
      .map((p) => p.opensAt!)
      .sort();
    if (abre.length > 0) return abre[0];
  }

  return "";
}

function nomeDoProximoDia(
  periodos: Periodo[],
  agora: { diaSemana: number; minutos: number },
): string | null {
  const aindaHoje = periodos.some(
    (p) =>
      p.dayOfWeek === agora.diaSemana &&
      !p.closed &&
      p.opensAt &&
      paraMinutos(p.opensAt) > agora.minutos,
  );
  if (aindaHoje) return null;

  for (let i = 1; i <= 7; i++) {
    const dia = (agora.diaSemana + i) % 7;
    if (periodos.some((p) => p.dayOfWeek === dia && !p.closed && p.opensAt)) {
      return i === 1 ? "amanhã" : DIAS[dia];
    }
  }
  return null;
}

export function nomeDoDia(indice: number) {
  return DIAS[indice] ?? "";
}
