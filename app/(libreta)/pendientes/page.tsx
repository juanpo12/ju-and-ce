import Link from 'next/link';
import { exigirPerfil } from '@/lib/sesion';
import { listarPendientes } from '@/db/queries';
import { Poster } from '@/components/Poster';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';
import { BotonYaLaVimos } from './BotonYaLaVimos';

export const metadata = { title: 'Pendientes — Nuestra libreta' };

export default async function Pendientes() {
  const perfil = await exigirPerfil();
  const pendientes = await listarPendientes(perfil.id);

  return (
    <>
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-4xl leading-none text-tinta md:text-5xl">Pendientes</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {pendientes.length === 0
              ? 'La lista está vacía'
              : `${pendientes.length} para ver`}
          </p>
        </div>
        <BotonLink href="/agregar" className="shrink-0">
          Agregar
        </BotonLink>
      </header>

      {pendientes.length === 0 ? (
        <Vacio
          titulo="Nada anotado"
          texto="Cuando alguno vea un tráiler que le llame la atención, sumalo acá y queda esperando."
          accion={<BotonLink href="/agregar">Sumar una</BotonLink>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {pendientes.map((p) => (
            <li key={p.id} className="tarjeta flex items-stretch gap-3 overflow-hidden">
              <Link href={`/peli/${p.id}`} className="foco w-20 shrink-0 sm:w-24">
                <Poster path={p.posterPath} titulo={p.titulo} tamano="chico" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3">
                <Link href={`/peli/${p.id}`} className="foco">
                  <h2 className="font-titulo text-xl leading-tight text-tinta">{p.titulo}</h2>
                </Link>
                <p className="text-xs text-tinta-suave">
                  {[p.anio, p.duracionMin && `${p.duracionMin} min`, p.generos[0]]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-tinta-suave">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        p.agregadaPor === perfil.id ? 'var(--durazno)' : 'var(--menta)',
                    }}
                    aria-hidden
                  />
                  La sumó {p.agregadaPor === perfil.id ? 'vos' : p.agregadaPorNombre}
                </p>
              </div>

              <div className="flex items-center pr-3">
                <BotonYaLaVimos entradaId={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
