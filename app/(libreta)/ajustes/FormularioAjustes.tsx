'use client';

import { useTransition, useState } from 'react';
import { Boton } from '@/components/Boton';
import { accionGuardarAjustes } from '@/app/acciones';

// Única excepción a «ningún componente escribe un hex a mano»: estas muestras
// tienen que mostrar los colores del tema que NO está activo, y las variables
// CSS siempre resuelven al activo.
const TEMAS = [
  { valor: 'papel', nombre: 'Papel y washi', muestra: ['#f5efe1', '#c2562f', '#2b2620'] },
  { valor: 'bullet', nombre: 'Bullet journal', muestra: ['#fbfaf7', '#7d6bc4', '#35323f'] },
  { valor: 'menta', nombre: 'Menta granizada', muestra: ['#e4f2ea', '#17795c', '#2a231d'] },
];

export function FormularioAjustes({ nombre, tema }: { nombre: string; tema: string }) {
  const [elegido, setElegido] = useState(tema);
  const [pendiente, empezar] = useTransition();
  const [guardado, setGuardado] = useState(false);

  return (
    <form
      action={(fd) =>
        empezar(async () => {
          await accionGuardarAjustes(fd);
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
          className="foco rounded-tema border border-borde bg-fondo px-3 py-2 text-base text-tinta outline-none"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-tinta">Tema</legend>
        {/* El tema se guarda en el perfil, no en el navegador: así cada uno tiene
            el suyo en cualquier dispositivo. */}
        <div className="grid gap-2 sm:grid-cols-3">
          {TEMAS.map((t) => (
            <label
              key={t.valor}
              className="flex cursor-pointer items-center gap-3 rounded-tema border px-3 py-2.5 transition"
              style={{
                borderColor: elegido === t.valor ? 'var(--acento)' : 'var(--borde)',
                backgroundColor: elegido === t.valor ? 'var(--acento-suave)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="tema"
                value={t.valor}
                checked={elegido === t.valor}
                onChange={() => setElegido(t.valor)}
                className="sr-only"
              />
              <span className="flex shrink-0 gap-0.5" aria-hidden>
                {t.muestra.map((c) => (
                  <span
                    key={c}
                    className="size-4 rounded-full border border-borde"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <span className="text-sm text-tinta">{t.nombre}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Boton type="submit" disabled={pendiente}>
          {pendiente ? 'Guardando…' : 'Guardar'}
        </Boton>
        <span className="text-xs text-tinta-suave" aria-live="polite">
          {guardado ? 'Guardado' : ''}
        </span>
      </div>
    </form>
  );
}
