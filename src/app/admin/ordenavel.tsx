"use client";

import { useEffect, useId, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Lista que se reordena arrastando.
 *
 * Três decisões que valem registro:
 *
 * 1. A ordem é aplicada na tela ANTES de o servidor responder. Esperar a
 *    resposta para mover o item deixaria um engasgo entre soltar e ver, e é
 *    justamente aí que a coisa parece quebrada. Se o servidor recusar, a
 *    ordem antiga volta e um aviso explica.
 *
 * 2. Arrastar só começa depois de 6px de movimento. Sem essa distância, um
 *    clique com a mão trêmula viraria arrasto e o botão embaixo nunca
 *    dispararia.
 *
 * 3. Teclado funciona: Tab até a alça, espaço para pegar, setas para mover,
 *    espaço de novo para soltar. Arrastar com o dedo não pode ser o único
 *    caminho, senão quem navega por teclado fica sem reordenar.
 */

export type ItemOrdenavel = { id: string };

export function ListaOrdenavel<T extends ItemOrdenavel>({
  itens,
  aoReordenar,
  children,
  className = "",
}: {
  itens: T[];
  /** Recebe a lista de ids na ordem nova. Deve devolver se deu certo. */
  aoReordenar: (idsNaOrdem: string[]) => Promise<boolean>;
  children: (item: T, indice: number) => React.ReactNode;
  className?: string;
}) {
  const [lista, setLista] = useState(itens);
  const [erro, setErro] = useState<string | null>(null);
  const contexto = useId();

  // Quando o servidor manda dados novos (depois de salvar, criar ou apagar),
  // a lista local precisa acompanhar, senão a tela fica presa no estado antigo.
  useEffect(() => setLista(itens), [itens]);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;

    const de = lista.findIndex((i) => i.id === active.id);
    const para = lista.findIndex((i) => i.id === over.id);
    if (de < 0 || para < 0) return;

    const anterior = lista;
    const nova = arrayMove(lista, de, para);

    setLista(nova); // move na tela primeiro
    setErro(null);

    const deuCerto = await aoReordenar(nova.map((i) => i.id));
    if (!deuCerto) {
      setLista(anterior); // desfaz se o servidor recusou
      setErro("Não consegui salvar a nova ordem. Tente de novo.");
    }
  }

  return (
    <>
      {erro && (
        <p role="alert" className="mb-3 rounded-xl border border-terracota/30 bg-terracota/8 px-4 py-3 text-sm text-terracota">
          {erro}
        </p>
      )}

      <DndContext
        id={contexto}
        sensors={sensores}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={aoSoltar}
      >
        <SortableContext items={lista.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className={className}>
            {lista.map((item, i) => (
              <ItemArrastavel key={item.id} id={item.id}>
                {children(item, i)}
              </ItemArrastavel>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}

function ItemArrastavel({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        // Enquanto arrasta, o item sobe acima dos vizinhos e ganha sombra,
        // para parecer que foi levantado da pilha em vez de escorregar por
        // baixo dela.
        zIndex: isDragging ? 30 : undefined,
        opacity: isDragging ? 0.92 : 1,
      }}
      className={isDragging ? "relative shadow-xl shadow-cacau/15" : "relative"}
    >
      <div className="flex items-stretch gap-2">
        {/* A alça é o único ponto que arrasta. Se a linha inteira arrastasse,
            selecionar um texto ou apertar um botão dentro dela viraria
            arrasto acidental. */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para mudar a ordem"
          className="btn shrink-0 cursor-grab touch-none rounded-lg px-1.5 text-tinta-tenue transition-colors hover:text-cacau active:cursor-grabbing"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden="true">
            <circle cx="7" cy="4" r="1.5" />
            <circle cx="13" cy="4" r="1.5" />
            <circle cx="7" cy="10" r="1.5" />
            <circle cx="13" cy="10" r="1.5" />
            <circle cx="7" cy="16" r="1.5" />
            <circle cx="13" cy="16" r="1.5" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </li>
  );
}
