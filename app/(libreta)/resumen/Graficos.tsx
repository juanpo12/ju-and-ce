'use client';

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { formatear } from '@/components/Estrellas';

/**
 * Los dos gráficos del resumen. Los colores son las variables del tema (el
 * acento y su versión suave), así que cambian solos con el tema y el modo.
 *
 * La animación de entrada no es la de Recharts: en `layout="vertical"` deja las
 * barras sin pintar. La hace el CSS (`.grafico-crece-*` en temas.css) con un
 * barrido sobre el contenedor, y respeta `prefers-reduced-motion` con la regla
 * global.
 */

const config = { cantidad: { label: 'Películas', color: 'var(--acento)' } } satisfies ChartConfig;

const eje = { fill: 'var(--tinta-suave)', fontSize: 12 };

export function GraficoPuntajes({ datos }: { datos: { estrellas: number; cantidad: number }[] }) {
  // Todos los medios puntos, aunque alguno no tenga películas: un hueco en la
  // escala también dice algo.
  const filas = Array.from({ length: 10 }, (_, i) => {
    const estrellas = (i + 1) / 2;
    return { estrellas, cantidad: datos.find((d) => d.estrellas === estrellas)?.cantidad ?? 0 };
  });
  const maximo = Math.max(...filas.map((f) => f.cantidad));

  return (
    <ChartContainer config={config} className="grafico-crece-y aspect-auto h-52 w-full">
      <BarChart data={filas} margin={{ top: 22, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="estrellas"
          tickLine={false}
          axisLine={false}
          tick={eje}
          interval={0}
          tickFormatter={(v: number) => (Number.isInteger(v) ? `${v}★` : '')}
        />
        <Bar
          dataKey="cantidad"
          radius={[6, 6, 2, 2]}
          isAnimationActive={false}
        >
          {filas.map((f) => (
            <Cell
              key={f.estrellas}
              // La más frecuente con el acento pleno, el resto un poco más apagado.
              fill={
                f.cantidad === maximo && maximo > 0
                  ? 'var(--acento)'
                  : 'color-mix(in srgb, var(--acento) 45%, var(--acento-suave))'
              }
            />
          ))}
          <LabelList
            dataKey="cantidad"
            position="top"
            className="fill-tinta-suave"
            fontSize={12}
            formatter={(v) => (Number(v) > 0 ? String(v) : '')}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function GraficoGeneros({ datos }: { datos: { genero: string; cantidad: number }[] }) {
  const filas = datos.slice(0, 8);

  return (
    <ChartContainer
      config={config}
      className="grafico-crece-x aspect-auto w-full"
      style={{ height: filas.length * 38 + 8 }}
    >
      <BarChart data={filas} layout="vertical" margin={{ top: 4, right: 32, left: 0, bottom: 4 }}>
        <YAxis
          dataKey="genero"
          type="category"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ ...eje, fill: 'var(--tinta)', fontSize: 13 }}
        />
        <XAxis type="number" hide />
        <Bar
          dataKey="cantidad"
          fill="var(--acento)"
          radius={[2, 6, 6, 2]}
          barSize={20}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="cantidad"
            position="right"
            className="fill-tinta-suave"
            fontSize={12}
            formatter={(v) => formatear(Number(v))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
