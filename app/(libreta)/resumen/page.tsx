import { exigirPerfil } from '@/lib/sesion';
import { contarPorGenero, distribucionDePuntajes, traerResumen } from '@/db/queries';
import { Estrellas, formatear } from '@/components/Estrellas';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';

export const metadata = { title: 'Resumen — Nuestra libreta' };

export default async function Resumen() {
  const perfil = await exigirPerfil();

  // Las tres agregaciones se calculan en Postgres, no en el navegador: llegan
  // listas para pintar.
  const [numeros, generos, distribucion] = await Promise.all([
    traerResumen(perfil.id),
    contarPorGenero(perfil.id),
    distribucionDePuntajes(perfil.id),
  ]);

  if (!numeros.vistas) {
    return (
      <>
        <h1 className="mb-5 font-titulo text-4xl leading-none text-tinta md:text-5xl">Resumen</h1>
        <Vacio
          titulo="Todavía no hay números"
          texto="Cuando empiecen a puntuar películas, acá van a aparecer los totales, los géneros y en cuántas coincidieron."
          accion={<BotonLink href="/agregar">Agregar la primera</BotonLink>}
        />
      </>
    );
  }

  return (
    <>
      <header className="mb-5">
        <h1 className="font-titulo text-4xl leading-none text-tinta md:text-5xl">Resumen</h1>
        <p className="mt-1 text-sm text-tinta-suave">{perfil.espacioNombre}</p>
      </header>

      {/* Mobile: tarjetas apiladas de a dos. Desktop: grilla de 2×2. */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Numero valor={String(numeros.vistas)} etiqueta="películas vistas" />
        <Numero
          valor={numeros.promedio !== null ? formatear(numeros.promedio) : '—'}
          etiqueta="promedio general"
        />
        <Numero valor={numeros.horas !== null ? `${numeros.horas}` : '—'} etiqueta="horas juntos" />
        <Numero
          valor={String(numeros.coincidimos)}
          etiqueta={`puntuaron los dos`}
        />
      </div>

      {distribucion.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-titulo text-2xl text-tinta">Cómo puntuamos</h2>
          <div className="tarjeta flex flex-col gap-2 px-4 py-4">
            {distribucion
              .slice()
              .reverse()
              .map(({ estrellas, cantidad }) => (
                <div key={estrellas} className="flex items-center gap-3">
                  <Estrellas valor={estrellas} medida="chico" className="w-24 shrink-0" />
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-acento-suave">
                    <div
                      className="h-full rounded-full bg-acento"
                      style={{ width: `${(cantidad / maximo(distribucion)) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-tinta-suave">
                    {cantidad}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {generos.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-titulo text-2xl text-tinta">Qué miramos</h2>
          <ul className="tarjeta flex flex-col divide-y divide-borde px-4">
            {generos.slice(0, 10).map(({ genero, cantidad }) => (
              <li key={genero} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-tinta">{genero}</span>
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-acento-suave">
                    <div
                      className="h-full rounded-full bg-acento"
                      style={{ width: `${(cantidad / generos[0]!.cantidad) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-tinta-suave">
                    {cantidad}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Numero({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="tarjeta flex flex-col items-center gap-0.5 px-3 py-6 text-center">
      <span className="font-titulo text-5xl leading-none text-acento">{valor}</span>
      <span className="text-xs text-tinta-suave">{etiqueta}</span>
    </div>
  );
}

function maximo(filas: { cantidad: number }[]) {
  return Math.max(...filas.map((f) => f.cantidad), 1);
}
