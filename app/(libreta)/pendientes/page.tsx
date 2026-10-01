import Link from 'next/link';
import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { esDemo } from '@/lib/demo';
import { historialDeNoches, listarPendientes, nocheActiva } from '@/db/queries';
import { Poster } from '@/components/Poster';
import { Avatar } from '@/components/Avatar';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';
import { ItemEscalonado } from '@/components/Escalonado';
import { BotonYaLaVimos } from './BotonYaLaVimos';
import { LaDeEstaNoche } from './LaDeEstaNoche';
import { BannerNoche } from './BannerNoche';

export const metadata = { title: 'Pendientes — Nuestra libreta' };

export default async function Pendientes() {
  const perfil = await exigirPerfil();
  const { yo, otro } = personasDe(perfil);

  // La sesión viva solo existe con la otra persona y con Supabase del otro lado.
  const [todas, sesion, [ultima]] = await Promise.all([
    listarPendientes(perfil.id),
    otro && !esDemo ? nocheActiva(perfil.id) : null,
    historialDeNoches(perfil.id, 1),
  ]);

  const elegida = todas.find((p) => p.elegidaEn) ?? null;
  const pendientes = elegida ? todas.filter((p) => p.id !== elegida.id) : todas;

  // Quién la sumó, con su color: el mismo que en la grilla y en la ficha.
  const quien = (id: string | null) => (id === yo.id ? yo : otro?.id === id ? otro : null);

  return (
    <>
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-5xl leading-none text-tinta md:text-6xl">Pendientes</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {todas.length === 0
              ? 'La lista está vacía'
              : `${todas.length} ${todas.length === 1 ? 'esperando' : 'esperando turno'}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {todas.length > 0 && !sesion && (
            <BotonLink href="/pendientes/noche" variante="secundario">
              <Dado />
              Noche de peli
            </BotonLink>
          )}
          <BotonLink href="/agregar" className="hidden md:inline-flex">
            Agregar
          </BotonLink>
        </div>
      </header>

      {sesion && otro && <BannerNoche sesion={sesion} yo={yo} otro={otro} />}

      {elegida && (
        <LaDeEstaNoche
          elegida={elegida}
          yo={yo}
          otro={otro}
          noche={ultima?.entradaId === elegida.id ? ultima : null}
        />
      )}

      {todas.length === 0 ? (
        <Vacio
          dibujo="entrada"
          titulo="Nada anotado"
          texto="Cuando alguno vea un tráiler que le llame la atención, sumalo acá y queda esperando su noche."
          accion={<BotonLink href="/agregar">Sumar una</BotonLink>}
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {pendientes.map((p, i) => {
            const persona = quien(p.agregadaPor);
            return (
              <ItemEscalonado
                key={p.id}
                indice={i}
                data-entrada={p.id}
                data-titulo={p.titulo}
                className="tarjeta flex items-center gap-3 overflow-hidden p-2.5 pr-3"
              >
                <Link
                  href={`/peli/${p.id}`}
                  className="foco tocable w-16 shrink-0 overflow-hidden rounded-[calc(var(--radio)-4px)] shadow-baja sm:w-20"
                  tabIndex={-1}
                  aria-hidden
                >
                  <Poster path={p.posterPath} titulo={p.titulo} anio={p.anio} tamano="chico" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link href={`/peli/${p.id}`} className="foco rounded-sm">
                    <h2 className="line-clamp-2 font-titulo text-2xl leading-[1.05] text-tinta">
                      {p.titulo}
                    </h2>
                  </Link>
                  <p className="truncate text-xs text-tinta-suave">
                    {[p.anio, p.duracionMin && `${p.duracionMin} min`, p.generos[0]]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-tinta-suave">
                    {persona && <Avatar persona={persona} medida="chico" />}
                    La sumó {p.agregadaPor === perfil.id ? 'vos' : p.agregadaPorNombre}
                  </p>
                </div>

                <BotonYaLaVimos entradaId={p.id} titulo={p.titulo} />
              </ItemEscalonado>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** Un dado, en el mismo trazo que los íconos de la nav. */
function Dado() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="9" cy="9" r="0.9" fill="currentColor" />
      <circle cx="15" cy="9" r="0.9" fill="currentColor" />
      <circle cx="9" cy="15" r="0.9" fill="currentColor" />
      <circle cx="15" cy="15" r="0.9" fill="currentColor" />
    </svg>
  );
}
