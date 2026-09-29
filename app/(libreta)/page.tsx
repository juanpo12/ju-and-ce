import { exigirPerfil } from '@/lib/sesion';
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

  const hayFiltros = Boolean(filtros.genero || filtros.anio || filtros.puntajeMinimo);

  return (
    <>
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          {/* En desktop el nombre del espacio ya está en la sidebar. */}
          <h1 className="font-titulo text-4xl leading-none text-tinta md:text-5xl">
            Biblioteca
          </h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {entradas.length === 0
              ? 'Todavía no hay nada'
              : `${entradas.length} ${entradas.length === 1 ? 'película' : 'películas'}`}
            {hayFiltros && ' con estos filtros'}
          </p>
        </div>
        <BotonLink href="/agregar" className="shrink-0">
          Agregar
        </BotonLink>
      </header>

      <FiltrosBiblioteca opciones={opciones} actuales={filtros} />

      {entradas.length === 0 ? (
        <div className="mt-8">
          {hayFiltros ? (
            <Vacio
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
              titulo="Acá va a estar todo"
              texto="Cada película que vean queda guardada con el puntaje y el comentario de los dos. Empezá por la primera."
              accion={<BotonLink href="/agregar">Agregar una película</BotonLink>}
            />
          )}
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-5">
          {entradas.map((entrada, i) => (
            <li key={entrada.id} className="contents">
              <TarjetaPeli
                entrada={entrada}
                miNombre={perfil.nombre}
                suNombre={perfil.companero?.nombre ?? null}
                prioridad={i < 4}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
