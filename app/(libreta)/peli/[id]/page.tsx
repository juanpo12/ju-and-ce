import { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { urlPoster } from '@/lib/tmdb-url';
import { buscarEntrada } from '@/db/queries';
import { Poster, tonoDe } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
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

  const { yo, otro } = personasDe(perfil);
  const coinciden = entrada.cuantosPuntuaron === 2 && entrada.promedio !== null;
  const faltan = [!entrada.mio && yo, otro && !entrada.suyo && otro].filter(Boolean) as NonNullable<
    typeof otro
  >[];
  const fondo = urlPoster(entrada.posterPath, 'w342');
  const tono = tonoDe(entrada.titulo);

  return (
    <article
      className="relative flex flex-col gap-7"
      data-ficha={entrada.id}
      data-titulo={entrada.titulo}
    >
      {/* El fondo de la ficha: el póster desenfocado, o el mismo degradado del
          afiche inventado. Sale hasta los bordes de la pantalla en mobile y se
          funde con el fondo del tema, así funciona en claro y en oscuro. */}
      <div
        aria-hidden
        // bg-fondo tapa la textura del tema detrás del título; la máscara la deja
        // volver de a poco hacia abajo, sin un corte.
        className="pointer-events-none absolute -inset-x-4 -top-5 h-[34rem] overflow-hidden bg-fondo [mask-image:linear-gradient(to_bottom,black_60%,transparent)] md:-inset-x-8 md:-top-8 md:h-[34rem]"
      >
        {fondo ? (
          <Image
            src={fondo}
            alt=""
            fill
            sizes="100vw"
            // Es lo más grande de la pantalla (el LCP): que no espere.
            loading="eager"
            className="scale-125 object-cover opacity-45 blur-2xl saturate-150"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(90% 80% at 30% 0%, oklch(0.6 0.12 ${tono}), transparent 70%), radial-gradient(70% 70% at 90% 20%, oklch(0.5 0.1 ${(tono + 40) % 360}), transparent 70%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-fondo/10 via-fondo/60 to-fondo" />
      </div>

      <Link
        href="/"
        className="foco tocable relative -mb-3 flex w-fit items-center gap-1.5 rounded-full bg-superficie/70 py-1.5 pl-2.5 pr-3.5 text-sm font-medium text-tinta shadow-baja backdrop-blur hover:text-acento"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Biblioteca
      </Link>

      <div className="relative flex flex-col gap-7 md:flex-row md:items-start md:gap-10">
        <div className="mx-auto w-[58%] max-w-64 shrink-0 md:sticky md:top-8 md:mx-0 md:w-72 md:max-w-none">
          <ViewTransition name={`poster-${entrada.id}`} share="morph" default="none">
            <div className="overflow-hidden rounded-tema shadow-alta ring-1 ring-tinta/5">
              <Poster
                path={entrada.posterPath}
                titulo={entrada.titulo}
                anio={entrada.anio}
                tamano="ficha"
                prioridad
              />
            </div>
          </ViewTransition>
        </div>

        <div className="flex min-w-0 flex-1 animate-in flex-col gap-7 duration-300 fade-in-0 slide-in-from-bottom-2 md:pt-2">
          <header className="text-center md:text-left">
            <h1 className="font-titulo text-5xl leading-[0.95] text-tinta [text-wrap:balance] md:text-6xl">
              {entrada.titulo}
            </h1>
            {entrada.tituloOriginal && entrada.tituloOriginal !== entrada.titulo && (
              <p className="mt-1.5 text-sm italic text-tinta-suave">{entrada.tituloOriginal}</p>
            )}

            <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-tinta-suave md:justify-start">
              {[
                entrada.tipo === 'serie' && 'Serie',
                entrada.anio,
                entrada.director,
                entrada.duracionMin && `${entrada.duracionMin} min`,
              ]
                .filter(Boolean)
                .map((dato, i) => (
                  <span
                    key={i}
                    className="after:ml-2 after:text-tinta-suave/50 after:content-['·'] last:after:content-['']"
                  >
                    {dato}
                  </span>
                ))}
            </p>

            {entrada.generos.length > 0 && (
              <ul className="mt-3 flex flex-wrap justify-center gap-1.5 md:justify-start">
                {entrada.generos.map((g) => (
                  <li
                    key={g}
                    className="rounded-full border border-borde bg-superficie/70 px-2.5 py-0.5 text-xs text-tinta-suave"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {entrada.estado === 'vista' && (
            <div className="tarjeta flex items-center gap-4 px-4 py-3.5">
              {coinciden ? (
                <>
                  <span className="font-cartel text-6xl leading-none tracking-wide text-acento">
                    {formatear(entrada.promedio!)}
                  </span>
                  <div className="flex flex-col gap-1">
                    <Estrellas valor={entrada.promedio} medida="base" />
                    <p className="text-xs text-tinta-suave">el promedio de los dos</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex -space-x-1.5">
                    {faltan.map((p) => (
                      <Avatar
                        key={p.id}
                        persona={p}
                        medida="grande"
                        vacio
                        className="bg-superficie"
                      />
                    ))}
                  </span>
                  <p className="text-sm text-tinta-suave">
                    {faltan.length === 2
                      ? 'Todavía no la puntuó ninguno de los dos.'
                      : faltan[0] === yo
                        ? 'Falta tu puntaje para el promedio.'
                        : `Falta el puntaje de ${faltan[0]!.nombre} para el promedio.`}
                  </p>
                </>
              )}
            </div>
          )}

          {entrada.sinopsis && (
            <section className="tarjeta px-4 py-4">
              <h2 className="mb-1.5 font-titulo text-3xl text-tinta">De qué va</h2>
              <p className="max-w-prose text-[0.95rem] leading-relaxed text-tinta">
                {entrada.sinopsis}
              </p>
            </section>
          )}

          <PanelPuntaje
            entradaId={entrada.id}
            yo={yo}
            otro={otro}
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
