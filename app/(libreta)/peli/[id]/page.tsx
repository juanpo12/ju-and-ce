import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { buscarEntrada } from '@/db/queries';
import { Poster } from '@/components/Poster';
import { Estrellas, formatear } from '@/components/Estrellas';
import { PanelPuntaje } from './PanelPuntaje';
import { DatosDeLaFuncion } from './DatosDeLaFuncion';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await exigirPerfil();
  const entrada = await buscarEntrada(perfil.id, (await params).id);
  return { title: entrada ? `${entrada.titulo} — Nuestra libreta` : 'Nuestra libreta' };
}

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await exigirPerfil();
  const entrada = await buscarEntrada(perfil.id, (await params).id);
  if (!entrada) notFound();

  const coinciden = entrada.cuantosPuntuaron === 2 && entrada.promedio !== null;

  return (
    <article className="flex flex-col gap-6">
      <Link href="/" className="foco -mb-2 w-fit text-sm text-tinta-suave hover:text-acento">
        ← Volver a la biblioteca
      </Link>

      {/* Mobile: una columna con scroll. Desktop: póster fijo a la izquierda. */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <div className="mx-auto w-40 shrink-0 overflow-hidden rounded-tema sm:w-48 md:sticky md:top-8 md:mx-0 md:w-60">
          <Poster path={entrada.posterPath} titulo={entrada.titulo} tamano="ficha" prioridad />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header>
            <h1 className="font-titulo text-4xl leading-none text-tinta md:text-5xl">
              {entrada.titulo}
            </h1>
            {entrada.tituloOriginal && entrada.tituloOriginal !== entrada.titulo && (
              <p className="mt-1 text-sm italic text-tinta-suave">{entrada.tituloOriginal}</p>
            )}

            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-tinta-suave">
              {[
                entrada.anio,
                entrada.director,
                entrada.duracionMin && `${entrada.duracionMin} min`,
              ]
                .filter(Boolean)
                .map((dato, i) => (
                  <span key={i} className="after:ml-2 after:text-borde after:content-['·'] last:after:content-['']">
                    {dato}
                  </span>
                ))}
            </p>

            {entrada.generos.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {entrada.generos.map((g) => (
                  <li
                    key={g}
                    className="rounded-full bg-acento-suave px-2.5 py-0.5 text-xs text-tinta-suave"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {coinciden && (
            <div className="tarjeta flex items-center gap-3 px-4 py-3">
              <Estrellas valor={entrada.promedio} medida="grande" />
              <div>
                <p className="font-titulo text-2xl leading-none text-tinta">
                  {formatear(entrada.promedio!)}
                </p>
                <p className="text-xs text-tinta-suave">promedio de los dos</p>
              </div>
            </div>
          )}

          {entrada.sinopsis && (
            <section>
              <h2 className="mb-1.5 font-titulo text-2xl text-tinta">De qué va</h2>
              <p className="text-sm leading-relaxed text-tinta-suave">{entrada.sinopsis}</p>
            </section>
          )}

          <PanelPuntaje
            entradaId={entrada.id}
            miNombre={perfil.nombre}
            suNombre={perfil.companero?.nombre ?? null}
            mio={entrada.mio}
            suyo={entrada.suyo}
          />

          <DatosDeLaFuncion
            entradaId={entrada.id}
            estado={entrada.estado}
            vistaEl={entrada.vistaEl}
            lugar={entrada.lugar}
            agregadaPor={entrada.agregadaPorNombre}
          />
        </div>
      </div>
    </article>
  );
}
