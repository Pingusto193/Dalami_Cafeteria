import { prisma } from "@/lib/prisma";
import { imagensDisponiveis } from "@/lib/midias";
import { Titulo } from "../../componentes";
import { FormularioItem } from "../formulario-item";

export default async function NovoItem() {
  const [categorias, imagens] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    imagensDisponiveis(),
  ]);

  if (categorias.length === 0) {
    return (
      <>
        <Titulo apoio="Antes de criar um item, crie pelo menos uma categoria no cardápio.">
          Novo item
        </Titulo>
      </>
    );
  }

  return (
    <>
      <Titulo apoio="Preencha o nome e o preço. O resto é opcional e pode ser ajustado depois.">
        Novo item
      </Titulo>
      <FormularioItem
        categorias={categorias.map((c) => ({ valor: c.id, rotulo: c.name }))}
        imagens={imagens}
      />
    </>
  );
}
