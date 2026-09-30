'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Clock, Eye, LoaderCircle, Search } from 'lucide-react';
import { Poster } from '@/components/Poster';
import { Boton } from '@/components/Boton';
import { Vacio } from '@/components/Vacio';
import { Skeleton } from '@/components/ui/skeleton';
import { DialogoAdaptable } from '@/components/DialogoAdaptable';
import { accionAgregar } from '@/app/acciones';
import { cn } from '@/lib/utils';
import { hoyISO } from '@/lib/fechas';

type Resultado = {
  tmdb_id: number;
  tipo: 'pelicula' | 'serie';
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

  const q = texto.trim();

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <span className="sr-only">Buscar película o serie</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-tinta-suave"
        />
        <input
          type="search"
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Interestelar, Parásitos, Severance…"
          className="foco w-full rounded-full border border-borde bg-superficie py-3.5 pl-12 pr-12 text-base text-tinta shadow-baja outline-none transition-colors placeholder:text-tinta-suave/70 focus:border-acento"
        />
        {buscando && (
          <LoaderCircle
            aria-label="Buscando"
            className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-acento"
          />
        )}
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {q.length < 2 && !resultados && (
        <p className="px-1 text-sm text-tinta-suave">
          Con dos letras alcanza. Los datos y el póster vienen de TMDB.
        </p>
      )}

      {/* Mientras llega la primera tanda, el esqueleto con la forma de las filas. */}
      {buscando && !resultados && <Esqueleto />}

      {resultados?.length === 0 && !buscando && (
        <Vacio
          dibujo="lupa"
          titulo="No encontramos nada"
          texto={`Nada para «${q}». Probá con el título original, o con menos palabras.`}
        />
      )}

      {resultados && resultados.length > 0 && (
        <ul
          className="flex flex-col gap-2.5 transition-opacity"
          style={{ opacity: buscando ? 0.6 : 1 }}
          aria-busy={buscando}
        >
          <AnimatePresence initial={true} mode="popLayout">
            {resultados.map((p, i) => (
              <motion.li
                // Una peli y una serie pueden tener el mismo id en TMDB.
                key={`${p.tipo}-${p.tmdb_id}`}
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{
                  duration: 0.25,
                  ease: [0.2, 0.8, 0.2, 1],
                  delay: Math.min(i, 8) * 0.03,
                }}
              >
                <Fila resultado={p} onElegir={() => setElegida(p)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Dialogo resultado={elegida} onCerrar={() => setElegida(null)} />
    </div>
  );
}

function Esqueleto() {
  return (
    <ul className="flex flex-col gap-2.5" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="tarjeta flex items-center gap-3 overflow-hidden p-2">
          <Skeleton className="aspect-[2/3] w-14 shrink-0 rounded-[calc(var(--radio)-4px)]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="mr-1 h-9 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

function Fila({ resultado, onElegir }: { resultado: Resultado; onElegir: () => void }) {
  const dentro = resultado.ya_en_biblioteca;
  return (
    <div className="tarjeta flex items-center gap-3 overflow-hidden p-2">
      <div className="w-14 shrink-0 overflow-hidden rounded-[calc(var(--radio)-4px)]">
        <Poster path={resultado.poster_path} titulo={resultado.titulo} tamano="chico" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="line-clamp-2 font-titulo text-xl leading-tight text-tinta">
          {resultado.titulo}
        </p>
        <p className="truncate text-xs text-tinta-suave">
          {[
            resultado.tipo === 'serie' && 'Serie',
            resultado.anio,
            resultado.generos.slice(0, 2).join(', '),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <div className="flex shrink-0 items-center pr-1">
        {dentro ? (
          <span className="flex items-center gap-1 rounded-full bg-acento-suave px-2.5 py-1 text-xs font-medium text-tinta">
            <Check className="size-3.5 text-acento" aria-hidden />
            Ya está
          </span>
        ) : (
          <Boton type="button" onClick={onElegir} className="rounded-full px-4">
            Agregar
          </Boton>
        )}
      </div>
    </div>
  );
}

/**
 * La elección clara entre «ya la vimos» y «queda pendiente»: dos opciones
 * grandes, y los datos de la función aparecen solo si hacen falta.
 */
function Dialogo({ resultado, onCerrar }: { resultado: Resultado | null; onCerrar: () => void }) {
  const router = useRouter();
  const [guardando, empezar] = useTransition();
  const [error, setError] = useState('');
  const [estado, setEstado] = useState<'vista' | 'pendiente'>('vista');

  // El último resultado elegido sigue dibujado mientras el cajón se cierra.
  const [mostrado, setMostrado] = useState(resultado);
  if (resultado && resultado !== mostrado) {
    setMostrado(resultado);
    setEstado('vista');
    setError('');
  }

  function agregar(fd?: FormData) {
    if (!mostrado) return;
    empezar(async () => {
      try {
        const id = await accionAgregar({
          tmdbId: mostrado.tmdb_id,
          tipo: mostrado.tipo,
          estado,
          vistaEl: estado === 'vista' ? (fd?.get('vista_el') as string) || null : null,
          lugar: estado === 'vista' ? (fd?.get('lugar') as string) || null : null,
        });
        router.push(estado === 'vista' ? `/peli/${id}` : '/pendientes');
      } catch {
        setError('No pudimos agregarla. Probá de nuevo.');
      }
    });
  }

  const input =
    'foco w-full rounded-tema border border-borde bg-fondo/60 px-3 py-2 text-base text-tinta outline-none transition-colors focus:border-acento';

  return (
    <DialogoAdaptable
      abierto={Boolean(resultado)}
      onCambio={(a) => !a && onCerrar()}
      titulo={mostrado?.titulo ?? ''}
      descripcion={mostrado?.anio ? String(mostrado.anio) : undefined}
    >
      <form action={agregar} className="flex flex-col gap-4">
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">¿Ya la vieron?</legend>
          <Opcion
            elegida={estado === 'vista'}
            onElegir={() => setEstado('vista')}
            icono={<Eye className="size-5" />}
            titulo="Ya la vimos"
            texto="Va a la biblioteca"
          />
          <Opcion
            elegida={estado === 'pendiente'}
            onElegir={() => setEstado('pendiente')}
            icono={<Clock className="size-5" />}
            titulo="Queda pendiente"
            texto="Para otro día"
          />
        </fieldset>

        <AnimatePresence initial={false}>
          {estado === 'vista' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 pb-1">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-tinta-suave">Cuándo</span>
                  <input
                    type="date"
                    name="vista_el"
                    defaultValue={hoyISO()}
                    className={input}
                  />
                </label>
                <label className="flex min-w-40 flex-1 flex-col gap-1">
                  <span className="text-xs font-semibold text-tinta-suave">Dónde</span>
                  <input
                    type="text"
                    name="lugar"
                    placeholder="el sillón, el cine…"
                    className={input}
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Boton type="button" variante="fantasma" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando} className="py-2.5">
            {guardando
              ? 'Guardando…'
              : estado === 'vista'
                ? 'Agregar a la biblioteca'
                : 'Sumar a pendientes'}
          </Boton>
        </div>
      </form>
    </DialogoAdaptable>
  );
}

function Opcion({
  elegida,
  onElegir,
  icono,
  titulo,
  texto,
}: {
  elegida: boolean;
  onElegir: () => void;
  icono: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <label
      className={cn(
        'tocable relative flex cursor-pointer flex-col gap-1.5 rounded-tema border-2 p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acento',
        elegida
          ? 'border-acento bg-acento-suave'
          : 'border-borde bg-superficie hover:border-tinta-suave/40',
      )}
    >
      <input type="radio" name="estado" checked={elegida} onChange={onElegir} className="sr-only" />
      <span className={elegida ? 'text-acento' : 'text-tinta-suave'} aria-hidden>
        {icono}
      </span>
      <span className="text-sm font-semibold text-tinta">{titulo}</span>
      <span className="text-xs text-tinta-suave">{texto}</span>
      {elegida && (
        <motion.span
          layoutId="opcion-elegida"
          className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-acento text-sobre-acento"
          transition={{ type: 'spring', bounce: 0.25, duration: 0.3 }}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </motion.span>
      )}
    </label>
  );
}
