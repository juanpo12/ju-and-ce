import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { ItemEscalonado } from '@/components/Escalonado';
import { listarBiblioteca, opcionesDeFiltro, type Filtros } from '@/db/queries';
import { TarjetaPeli } from '@/components/TarjetaPeli';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';
import { FiltrosBiblioteca } from './FiltrosBiblioteca';

export const metadata = { title: 'Biblioteca — Nuestra libreta' };

export default async function Biblioteca({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const perfil = await exigirPerfil();
  const q = await searchParams;

  const filtros: Filtros = {
    genero: q.genero || undefined,
    anio: q.anio ? Number(q.anio) : undefined,
    puntajeMinimo: q.min ? Number(q.min) : undefined,
    orden: (q.orden as Filtros['orden']) || 'recientes',
  };

  // Las dos lecturas son del servidor: la biblioteca llega renderizada con
  // datos, sin spinner ni salto de layout.
  const [entradas, opciones] = await Promise.all([
    listarBiblioteca(perfil.id, filtros),
    opcionesDeFiltro(perfil.id),
  ]);

  const { yo, otro } = personasDe(perfil);
  const hayFiltros = Boolean(filtros.genero || filtros.anio || filtros.puntajeMinimo);

  return (
    <>
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-5xl leading-none text-tinta md:text-6xl">Biblioteca</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {entradas.length === 0
              ? 'Todavía no hay nada'
              : `${entradas.length} ${entradas.length === 1 ? 'película' : 'películas'}`}
            {hayFiltros && ' con estos filtros'}
          </p>
        </div>
        {/* En mobile, agregar ya está en el centro de la barra de abajo. */}
        <BotonLink href="/agregar" className="hidden shrink-0 md:inline-flex">
          Agregar
        </BotonLink>
      </header>

      <FiltrosBiblioteca opciones={opciones} actuales={filtros} />

      {entradas.length === 0 ? (
        <div className="mt-8">
          {hayFiltros ? (
            <Vacio
              dibujo="lupa"
              titulo="Nada con esos filtros"
              texto="Probá aflojar alguno: capaz todavía no vieron ninguna que cumpla."
              accion={
                <BotonLink href="/" variante="secundario">
                  Limpiar filtros
                </BotonLink>
              }
            />
          ) : (
            <Vacio
              dibujo="rollo"
              titulo="Acá va a estar todo"
              texto="Cada película que vean queda guardada con el puntaje y el comentario de los dos. Empezá por la primera."
              accion={<BotonLink href="/agregar">Agregar una película</BotonLink>}
            />
          )}
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 md:gap-y-7 xl:grid-cols-5">
          {entradas.map((entrada, i) => (
            // `data-entrada` es lo que busca EscuchaCambios para resaltar la
            // tarjeta cuando el otro puntúa.
            <ItemEscalonado
              key={entrada.id}
              indice={i}
              data-entrada={entrada.id}
              data-titulo={entrada.titulo}
              className="rounded-tema"
            >
              <TarjetaPeli entrada={entrada} yo={yo} otro={otro} prioridad={i < 4} />
            </ItemEscalonado>
          ))}
        </ul>
      )}
    </>
  );
}
