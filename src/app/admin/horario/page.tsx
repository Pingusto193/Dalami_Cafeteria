import { prisma } from "@/lib/prisma";
import { Titulo } from "../componentes";
import { PainelHorario } from "./painel";

export default async function AdminHorario() {
  const horarios = await prisma.businessHours.findMany({
    where: { periodOrder: 0 },
    orderBy: { dayOfWeek: "asc" },
  });

  const porDia = new Map(horarios.map((h) => [h.dayOfWeek, h]));

  return (
    <>
      <Titulo apoio="O site usa isto para mostrar 'Aberto agora' ou 'Fechado agora' para quem visita, no horário de Brasília.">
        Horário de funcionamento
      </Titulo>

      <PainelHorario
        dias={[1, 2, 3, 4, 5, 6, 0].map((dia) => {
          const h = porDia.get(dia);
          return {
            dia,
            fechado: h?.closed ?? true,
            abre: h?.opensAt ?? "08:00",
            fecha: h?.closesAt ?? "18:00",
          };
        })}
      />
    </>
  );
}
