import { prisma } from "@/lib/prisma";
import { Titulo } from "../componentes";
import { PainelHorario } from "./painel";
import { Feriados } from "./feriados";

export default async function AdminHorario() {
  const [horarios, especiais] = await Promise.all([
    prisma.businessHours.findMany({ where: { periodOrder: 0 }, orderBy: { dayOfWeek: "asc" } }),
    prisma.specialHours.findMany({ orderBy: { date: "desc" } }),
  ]);

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

      <div className="mt-6 max-w-2xl">
        <Feriados
          feriados={especiais.map((e) => ({
            id: e.id,
            // `date` é @db.Date, então a parte de data já basta e nenhum fuso
            // consegue empurrar para o dia anterior.
            data: e.date.toISOString().slice(0, 10),
            fechado: e.closed,
            abre: e.opensAt ?? "",
            fecha: e.closesAt ?? "",
            motivo: e.label ?? "",
          }))}
        />
      </div>
    </>
  );
}
