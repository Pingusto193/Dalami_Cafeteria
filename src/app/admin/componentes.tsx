"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Resultado } from "@/lib/admin";

/* ===========================================================================
   Peças de formulário do painel.

   Regra que vale para todas: o rótulo diz o que a coisa FAZ no site, não o
   nome técnico do campo. Quem usa isto não é programador.
   =========================================================================== */

const BORDA =
  "w-full rounded-xl border border-tinta/15 bg-creme px-3.5 py-2.5 text-tinta outline-none transition-colors focus:border-oliva";

export function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-rotulo text-[0.58rem] uppercase tracking-[0.18em] text-tinta-suave">
      {children}
    </span>
  );
}

export function Campo({
  nome,
  rotulo,
  valor,
  dica,
  tipo = "text",
  obrigatorio,
  placeholder,
}: {
  nome: string;
  rotulo: string;
  valor?: string | number | null;
  dica?: string;
  tipo?: string;
  obrigatorio?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Rotulo>{rotulo}</Rotulo>
      <input
        name={nome}
        type={tipo}
        defaultValue={valor ?? ""}
        required={obrigatorio}
        placeholder={placeholder}
        className={`mt-1.5 ${BORDA}`}
      />
      {dica && <span className="mt-1.5 block text-xs text-tinta-tenue">{dica}</span>}
    </label>
  );
}

export function Area({
  nome,
  rotulo,
  valor,
  dica,
  linhas = 4,
}: {
  nome: string;
  rotulo: string;
  valor?: string | null;
  dica?: string;
  linhas?: number;
}) {
  return (
    <label className="block">
      <Rotulo>{rotulo}</Rotulo>
      <textarea
        name={nome}
        rows={linhas}
        defaultValue={valor ?? ""}
        className={`mt-1.5 resize-y ${BORDA}`}
      />
      {dica && <span className="mt-1.5 block text-xs text-tinta-tenue">{dica}</span>}
    </label>
  );
}

export function Selecao({
  nome,
  rotulo,
  valor,
  opcoes,
  dica,
}: {
  nome: string;
  rotulo: string;
  valor?: string | null;
  opcoes: { valor: string; rotulo: string }[];
  dica?: string;
}) {
  return (
    <label className="block">
      <Rotulo>{rotulo}</Rotulo>
      <select name={nome} defaultValue={valor ?? ""} className={`mt-1.5 ${BORDA}`}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {dica && <span className="mt-1.5 block text-xs text-tinta-tenue">{dica}</span>}
    </label>
  );
}

export function Interruptor({
  nome,
  rotulo,
  ligado,
  dica,
}: {
  nome: string;
  rotulo: string;
  ligado?: boolean;
  dica?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        name={nome}
        type="checkbox"
        defaultChecked={ligado}
        className="mt-0.5 size-5 shrink-0 accent-[var(--color-oliva)]"
      />
      <span>
        <span className="block text-sm font-medium text-tinta">{rotulo}</span>
        {dica && <span className="mt-0.5 block text-xs text-tinta-tenue">{dica}</span>}
      </span>
    </label>
  );
}

export function Salvar({ children = "Salvar" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn rounded-full bg-oliva px-6 py-2.5 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro disabled:opacity-60"
    >
      {pending ? "Salvando..." : children}
    </button>
  );
}

/**
 * Botão de apagar com confirmação em dois toques.
 *
 * Sem `confirm()` do navegador de propósito: ele é feio, some em alguns
 * navegadores e não dá para escrever em português direito. Aqui o primeiro
 * clique troca o rótulo para "Tem certeza?" e o segundo apaga. Cinco segundos
 * sem clicar e ele volta ao normal sozinho.
 */
export function Excluir({ rotulo = "Apagar" }: { rotulo?: string }) {
  const { pending } = useFormStatus();
  const [confirmando, setConfirmando] = useState(false);
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (relogio.current) clearTimeout(relogio.current); }, []);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => {
          setConfirmando(true);
          relogio.current = setTimeout(() => setConfirmando(false), 5000);
        }}
        className="btn rounded-full px-4 py-2 text-xs text-tinta-tenue transition-colors hover:text-terracota"
      >
        {rotulo}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn rounded-full bg-terracota px-4 py-2 text-xs font-medium text-creme-alto transition-colors hover:bg-terracota-claro disabled:opacity-60"
    >
      {pending ? "Apagando..." : "Tem certeza?"}
    </button>
  );
}

export function Aviso({ resultado }: { resultado: Resultado | null }) {
  if (!resultado || !resultado.mensagem) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 text-sm ${
        resultado.ok
          ? "border-oliva/30 bg-oliva/8 text-oliva-escuro"
          : "border-terracota/30 bg-terracota/8 text-terracota"
      }`}
    >
      {resultado.mensagem}
    </p>
  );
}

/**
 * Abre e fecha o conteúdo com uma animação, em vez de ele piscar e sumir.
 *
 * Duas coisas que o React não faz sozinho e que este componente resolve:
 *
 * 1. Ao FECHAR, o React tiraria o elemento da tela no mesmo instante, e não
 *    sobraria nada para animar. Aqui o conteúdo continua montado até a
 *    animação terminar, e só então some.
 *
 * 2. Ao ABRIR, um elemento que nasce já aberto não anima, porque não houve
 *    mudança de estado para o navegador perceber. Por isso ele monta fechado
 *    e só abre no quadro seguinte.
 */
export function Recolhivel({
  aberto,
  children,
  className = "",
}: {
  aberto: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [montado, setMontado] = useState(aberto);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    if (aberto) {
      setMontado(true);
      // Espera um quadro: sem isso o elemento nasceria já aberto e o
      // navegador não teria de onde animar.
      const quadro = requestAnimationFrame(() => setExpandido(true));
      return () => cancelAnimationFrame(quadro);
    }

    setExpandido(false);
    // Segura o conteúdo montado até a animação de fechar acabar.
    const relogio = setTimeout(() => setMontado(false), 320);
    return () => clearTimeout(relogio);
  }, [aberto]);

  if (!montado) return null;

  return (
    <div className={`recolhivel ${expandido ? "recolhivel-aberto" : ""} ${className}`}>
      <div>{children}</div>
    </div>
  );
}

export function Cartao({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[1.25rem] border border-tinta/10 bg-creme-alto p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Titulo({
  children,
  apoio,
  acao,
}: {
  children: React.ReactNode;
  apoio?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(1.7rem,3.6vw,2.2rem)] font-semibold text-cacau">
          {children}
        </h1>
        {apoio && <p className="mt-1.5 max-w-[62ch] text-sm text-tinta-suave">{apoio}</p>}
      </div>
      {acao}
    </div>
  );
}

/* ===========================================================================
   Escolha de imagem
   =========================================================================== */

export type ImagemDisponivel = {
  id: string;
  url: string;
  alt: string;
};

/**
 * Comprime a foto NO NAVEGADOR antes de enviar.
 *
 * Foto de celular vem com 8 a 12 MB. Sem isto, o dono esperaria minutos num
 * 4G ruim e o servidor receberia um arquivo enorme à toa. Passar pelo canvas
 * também joga fora os metadados EXIF, incluindo a coordenada de GPS.
 */
async function encolherNoNavegador(arquivo: File): Promise<Blob> {
  const LADO = 1600;
  const bitmap = await createImageBitmap(arquivo);

  const escala = Math.min(1, LADO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  const ctx = tela.getContext("2d");
  if (!ctx) return arquivo;
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    tela.toBlob(resolve, "image/webp", 0.85),
  );
  return blob ?? arquivo;
}

export function EscolherImagem({
  nome,
  rotulo,
  atual,
  disponiveis,
  dica,
}: {
  nome: string;
  rotulo: string;
  atual?: ImagemDisponivel | null;
  disponiveis: ImagemDisponivel[];
  dica?: string;
}) {
  const [escolhida, setEscolhida] = useState<ImagemDisponivel | null>(atual ?? null);
  const [abrindo, setAbrindo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [lista, setLista] = useState(disponiveis);

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro(null);
    setEnviando(true);
    try {
      if (arquivo.size > 10 * 1024 * 1024) {
        setErro("Essa foto tem mais de 10 MB. Escolha uma menor.");
        return;
      }

      const menor = await encolherNoNavegador(arquivo);
      const dados = new FormData();
      dados.append("arquivo", menor, "foto.webp");
      dados.append("alt", arquivo.name.replace(/\.[^.]+$/, ""));

      const resposta = await fetch("/admin/api/imagem", { method: "POST", body: dados });
      const json = await resposta.json();

      if (!resposta.ok) {
        setErro(json.erro ?? "Não consegui enviar a foto.");
        return;
      }

      const nova: ImagemDisponivel = { id: json.id, url: json.url, alt: json.alt };
      setLista((l) => [nova, ...l]);
      setEscolhida(nova);
      setAbrindo(false);
    } catch {
      setErro("Não consegui ler essa foto. Tente outra.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <Rotulo>{rotulo}</Rotulo>
      <input type="hidden" name={nome} value={escolhida?.id ?? ""} />

      <div className="mt-1.5 flex items-center gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-tinta/12 bg-creme">
          {escolhida ? (
            <Image src={escolhida.url} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-[0.6rem] text-tinta-tenue">
              sem foto
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAbrindo((v) => !v)}
            className="btn rounded-full border border-cacau/20 px-4 py-2 text-xs font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
          >
            {abrindo ? "Fechar" : "Escolher foto"}
          </button>
          {escolhida && (
            <button
              type="button"
              onClick={() => setEscolhida(null)}
              className="btn rounded-full px-3 py-2 text-xs text-tinta-tenue transition-colors hover:text-terracota"
            >
              Tirar a foto
            </button>
          )}
        </div>
      </div>

      {dica && <p className="mt-2 text-xs text-tinta-tenue">{dica}</p>}
      {erro && <p className="mt-2 text-xs text-terracota">{erro}</p>}

      <Recolhivel aberto={abrindo} className="mt-4">
        <div className="rounded-xl border border-tinta/12 bg-creme p-4">
          <label className="btn inline-flex cursor-pointer rounded-full bg-oliva px-5 py-2.5 text-xs font-medium text-creme-alto transition-colors hover:bg-oliva-escuro">
            {enviando ? "Enviando..." : "Enviar uma foto nova"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={enviando}
              onChange={enviar}
            />
          </label>

          <p className="mt-3 text-xs text-tinta-tenue">
            Ou reaproveite uma que já está no site:
          </p>

          <div className="mt-3 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {lista.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setEscolhida(img);
                  setAbrindo(false);
                }}
                title={img.alt}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  escolhida?.id === img.id ? "border-oliva" : "border-transparent hover:border-dourado"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </Recolhivel>
    </div>
  );
}
