import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import {
  contarPorGenero,
  distribucionDePuntajes,
  nightsHistory,
  nightsTally,
  traerResumen,
} from '@/db/queries';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';
import { Contador } from '@/components/Contador';
import { GraficoGeneros, GraficoPuntajes } from './Graficos';
import { NightsSummary } from './NightsSummary';

export const metadata = { title: 'Resumen — Nuestra libreta' };

export default async function Resumen() {
  const perfil = await exigirPerfil();
  const { yo: me, otro: other } = personasDe(perfil);

  // Las agregaciones se calculan en Postgres, no en el navegador: llegan
  // listas para pintar.
  const [numeros, generos, distribucion, nights, latestNights] = await Promise.all([
    traerResumen(perfil.id),
    contarPorGenero(perfil.id),
    distribucionDePuntajes(perfil.id),
    nightsTally(perfil.id),
    nightsHistory(perfil.id, 4),
  ]);

  if (!numeros.vistas) {
    return (
      <>
        <h1 className="mb-5 font-titulo text-5xl leading-none text-tinta md:text-6xl">Resumen</h1>
        <Vacio
          dibujo="pochoclos"
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
        <h1 className="font-titulo text-5xl leading-none text-tinta md:text-6xl">Resumen</h1>
        <p className="mt-1 text-sm text-tinta-suave">{perfil.espacioNombre}</p>
      </header>

      {/* Mobile: de a dos. Desktop: los cuatro en fila, como una marquesina. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Numero etiqueta="películas vistas" destacado>
          <Contador valor={numeros.vistas} />
        </Numero>
        <Numero etiqueta="promedio general">
          {numeros.promedio !== null ? <Contador valor={numeros.promedio} decimales={1} /> : '—'}
        </Numero>
        <Numero etiqueta="horas juntos">
          {numeros.horas !== null ? <Contador valor={numeros.horas} /> : '—'}
        </Numero>
        <Numero etiqueta="puntuaron los dos">
          <Contador valor={numeros.coincidimos} />
        </Numero>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {distribucion.length > 0 && (
          <section>
            <h2 className="mb-2 font-titulo text-3xl text-tinta">Cómo puntuamos</h2>
            <div className="tarjeta px-3 pb-2 pt-3">
              <GraficoPuntajes datos={distribucion} />
            </div>
          </section>
        )}

        {generos.length > 0 && (
          <section>
            <h2 className="mb-2 font-titulo text-3xl text-tinta">Qué miramos</h2>
            <div className="tarjeta px-3 py-3">
              <GraficoGeneros datos={generos} />
            </div>
          </section>
        )}

        {nights.total > 0 && <NightsSummary tally={nights} latest={latestNights} me={me} other={other} />}
      </div>
    </>
  );
}

function Numero({
  etiqueta,
  destacado = false,
  children,
}: {
  etiqueta: string;
  destacado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        destacado
          ? 'flex flex-col items-center gap-1 rounded-tema bg-acento px-3 py-5 text-center text-sobre-acento shadow-alta'
          : 'tarjeta flex flex-col items-center gap-1 px-3 py-5 text-center'
      }
    >
      <span
        className={`font-cartel text-6xl leading-none tracking-wide ${destacado ? '' : 'text-acento'}`}
      >
        {children}
      </span>
      <span className={`text-xs ${destacado ? 'opacity-85' : 'text-tinta-suave'}`}>{etiqueta}</span>
    </div>
  );
}
