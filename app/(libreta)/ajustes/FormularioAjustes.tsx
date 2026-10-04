'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { Boton } from '@/components/Boton';
import { accionGuardarAjustes } from '@/app/acciones';
import { GRUPOS, PALETAS, TEMAS, temaValido, type Tema } from '@/lib/temas';
import { cn } from '@/lib/utils';

/**
 * Fetches a theme's CSS unless the page already has it: the active theme came
 * inlined with the HTML, and previewed ones stay.
 */
function loadThemeCss(theme: Tema): Promise<void> {
  if (theme === 'papel' || document.querySelector(`[data-theme-css="${theme}"]`)) return Promise.resolve();
  return new Promise((done) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/theme-css/${theme}.css`;
    link.dataset.themeCss = theme;
    link.onload = link.onerror = () => done();
    document.head.appendChild(link);
  });
}

export function FormularioAjustes({ nombre, tema }: { nombre: string; tema: string }) {
  const [elegido, setElegido] = useState<Tema>(temaValido(tema));
  const [pendiente, empezar] = useTransition();
  const [guardado, setGuardado] = useState(false);

  // Lo guardado en el perfil, para volver a eso si se va sin guardar.
  const guardadoEnPerfil = useRef(temaValido(tema));

  // El tema se prueba en vivo: elegir una muestra pinta la app entera, que es la
  // única forma de saber si gusta. Hasta que no se guarda, es un ensayo: al
  // salir de la pantalla vuelve el de siempre.
  //
  // Each theme's CSS downloads only when its swatch is tapped, and `data-tema`
  // changes once it arrived: switching earlier would flash a half-styled page.
  useEffect(() => {
    let current = true;
    void loadThemeCss(elegido).then(() => {
      if (current) document.documentElement.dataset.tema = elegido;
    });
    return () => {
      current = false;
    };
  }, [elegido]);
  useEffect(() => {
    return () => {
      document.documentElement.dataset.tema = guardadoEnPerfil.current;
    };
  }, []);

  return (
    <form
      action={(fd) =>
        empezar(async () => {
          await accionGuardarAjustes(fd);
          guardadoEnPerfil.current = elegido;
          setGuardado(true);
          setTimeout(() => setGuardado(false), 2000);
        })
      }
      className="tarjeta flex flex-col gap-5 px-4 py-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-tinta">Tu nombre</span>
        <input
          type="text"
          name="nombre"
          defaultValue={nombre}
          required
          maxLength={40}
          className="foco rounded-tema border border-borde bg-fondo px-3 py-2.5 text-base text-tinta outline-none"
        />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-tinta">
          Tema
          <span className="ml-2 font-normal text-tinta-suave">{PALETAS[elegido].nombre}</span>
        </legend>
        {/* El tema se guarda en el perfil, no en el navegador: así cada uno tiene
            el suyo en cualquier dispositivo. */}
        <input type="hidden" name="tema" value={elegido} />

        {GRUPOS.map((grupo) => (
          <div key={grupo.id} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tinta-suave">
              {grupo.nombre}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {TEMAS.filter((t) => PALETAS[t].grupo === grupo.id).map((valor) => (
                <Muestra
                  key={valor}
                  tema={valor}
                  elegido={elegido === valor}
                  onElegir={() => setElegido(valor)}
                />
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <Boton type="submit" disabled={pendiente}>
          {pendiente ? 'Guardando…' : 'Guardar'}
        </Boton>
        <span className="text-xs text-tinta-suave" aria-live="polite">
          {guardado ? 'Guardado' : elegido !== guardadoEnPerfil.current ? 'Probando el tema' : ''}
        </span>
      </div>
    </form>
  );
}

/**
 * Una muestra del tema: el fondo claro y el oscuro partidos en diagonal, con
 * el acento encima. Son hex de lib/temas.ts y no variables: la variable
 * resolvería al tema activo, y acá hay que mostrar los otros diecinueve.
 */
function Muestra({ tema, elegido, onElegir }: { tema: Tema; elegido: boolean; onElegir: () => void }) {
  const { nombre, claro, oscuro } = PALETAS[tema];
  return (
    <label
      className={cn(
        'tocable group flex cursor-pointer flex-col items-center gap-1.5 rounded-tema p-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acento',
        elegido ? 'bg-acento-suave' : 'hover:bg-acento-suave/50',
      )}
    >
      <input
        type="radio"
        name="tema-muestra"
        value={tema}
        checked={elegido}
        onChange={onElegir}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-[calc(var(--radio)-4px)] border transition-shadow',
          elegido ? 'border-acento ring-2 ring-acento' : 'border-tinta/10',
        )}
        style={{
          backgroundImage: `linear-gradient(135deg, ${claro.fondo} 50%, ${oscuro.fondo} 50%)`,
        }}
      >
        <span className="flex -space-x-2">
          <span
            className="size-5 rounded-full ring-2"
            style={{ backgroundColor: claro.acento, '--tw-ring-color': claro.fondo } as React.CSSProperties}
          />
          <span
            className="size-5 rounded-full ring-2"
            style={{ backgroundColor: oscuro.acento, '--tw-ring-color': oscuro.fondo } as React.CSSProperties}
          />
        </span>
        {elegido && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-acento text-sobre-acento">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </span>
      <span
        className={cn(
          'line-clamp-2 text-center text-[0.7rem] leading-tight',
          elegido ? 'font-semibold text-tinta' : 'text-tinta-suave',
        )}
      >
        {nombre}
      </span>
    </label>
  );
}
