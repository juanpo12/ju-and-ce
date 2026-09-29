'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { urlPoster } from '@/lib/tmdb-url';
import { Boton } from '@/components/Boton';
import { Vacio } from '@/components/Vacio';
import { accionAgregar } from '@/app/acciones';

type Resultado = {
  tmdb_id: number;
  titulo: string;
  anio: number | null;
  generos: string[];
  poster_path: string | null;
  sinopsis: string | null;
  ya_en_biblioteca: boolean;
};

export function Buscador() {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [elegida, setElegida] = useState<Resultado | null>(null);

  // Una búsqueda por pausa de tecleo, y la anterior se cancela: sin esto cada
  // letra dispara un request a TMDB y las respuestas llegan desordenadas.
  const aborto = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = texto.trim();
    if (q.length < 2) {
      setResultados(null);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    const t = setTimeout(async () => {
      aborto.current?.abort();
      const control = new AbortController();
      aborto.current = control;

      try {
        const r = await fetch(`/api/peliculas?q=${encodeURIComponent(q)}`, {
          signal: control.signal,
        });
        if (!r.ok) throw new Error();
        const datos = (await r.json()) as { resultados: Resultado[] };
        setResultados(datos.resultados);
        setError('');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError('No pudimos buscar. Probá de nuevo en un momento.');
        }
      } finally {
        setBuscando(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [texto]);

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <span className="sr-only">Buscar película</span>
        <input
          type="search"
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Interestelar, Parásitos, El viaje de Chihiro…"
          className="foco w-full rounded-tema border border-borde bg-superficie px-4 py-3 text-base text-tinta outline-none placeholder:text-tinta-suave/60"
        />
        {buscando && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-tinta-suave">
            buscando…
          </span>
        )}
      </label>

      {error && (
        <p role="alert" className="text-sm text-acento">
          {error}
        </p>
      )}

      {resultados?.length === 0 && !buscando && (
        <Vacio
          titulo="No encontramos nada"
          texto="Probá con el título original, o con menos palabras."
        />
      )}

      {resultados && resultados.length > 0 && (
        <ul className="flex flex-col gap-2">
          {resultados.map((p) => (
            <li key={p.tmdb_id}>
              <Fila resultado={p} onElegir={() => setElegida(p)} />
            </li>
          ))}
        </ul>
      )}

      {elegida && <Dialogo resultado={elegida} onCerrar={() => setElegida(null)} />}
    </div>
  );
}

function Fila({ resultado, onElegir }: { resultado: Resultado; onElegir: () => void }) {
  const poster = urlPoster(resultado.poster_path, 'w185');

  return (
    <div className="tarjeta flex items-stretch gap-3 overflow-hidden">
      <div className="w-16 shrink-0 bg-acento-suave">
        {poster ? (
          <Image
            src={poster}
            alt=""
            width={92}
            height={138}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full min-h-24" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-2.5">
        <p className="font-titulo text-lg leading-tight text-tinta">{resultado.titulo}</p>
        <p className="text-xs text-tinta-suave">
          {[resultado.anio, resultado.generos.slice(0, 2).join(', ')].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="flex items-center pr-3">
        {resultado.ya_en_biblioteca ? (
          <span className="text-right text-xs leading-tight text-tinta-suave">
            Ya está en
            <br />
            la biblioteca
          </span>
        ) : (
          <Boton type="button" onClick={onElegir}>
            Agregar
          </Boton>
        )}
      </div>
    </div>
  );
}

function Dialogo({ resultado, onCerrar }: { resultado: Resultado; onCerrar: () => void }) {
  const router = useRouter();
  const [guardando, empezar] = useTransition();
  const [error, setError] = useState('');

  function agregar(estado: 'vista' | 'pendiente', fd?: FormData) {
    empezar(async () => {
      try {
        const id = await accionAgregar({
          tmdbId: resultado.tmdb_id,
          estado,
          vistaEl: (fd?.get('vista_el') as string) || null,
          lugar: (fd?.get('lugar') as string) || null,
        });
        router.push(estado === 'vista' ? `/peli/${id}` : '/pendientes');
      } catch {
        setError('No pudimos agregarla. Probá de nuevo.');
      }
    });
  }

  const input =
    'foco rounded-tema border border-borde bg-fondo px-3 py-2 text-sm text-tinta outline-none';

  return (
    // En mobile ocupa la pantalla; en desktop es un modal sobre la biblioteca.
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-tinta/40 p-0 md:items-center md:p-6"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Agregar ${resultado.titulo}`}
        onClick={(e) => e.stopPropagation()}
        className="safe-abajo max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-tema border border-borde bg-superficie px-5 pb-6 pt-5 md:rounded-tema"
      >
        <h2 className="font-titulo text-3xl leading-tight text-tinta">{resultado.titulo}</h2>
        {resultado.anio && <p className="text-sm text-tinta-suave">{resultado.anio}</p>}

        <form
          action={(fd) => agregar('vista', fd)}
          className="mt-5 flex flex-col gap-3 border-t border-borde pt-4"
        >
          <p className="text-sm font-semibold text-tinta">Ya la vimos</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-tinta-suave">Cuándo</span>
              <input
                type="date"
                name="vista_el"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className={input}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-semibold text-tinta-suave">Dónde</span>
              <input
                type="text"
                name="lugar"
                placeholder="el sillón, el cine…"
                className={`${input} w-full`}
              />
            </label>
          </div>
          <Boton type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Agregar como vista'}
          </Boton>
        </form>

        <div className="mt-4 flex flex-col gap-2 border-t border-borde pt-4">
          <p className="text-sm font-semibold text-tinta">O todavía no</p>
          <Boton
            type="button"
            variante="secundario"
            disabled={guardando}
            onClick={() => agregar('pendiente')}
          >
            Sumar a pendientes
          </Boton>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-acento">
            {error}
          </p>
        )}

        <Boton type="button" variante="fantasma" className="mt-3 w-full" onClick={onCerrar}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}
