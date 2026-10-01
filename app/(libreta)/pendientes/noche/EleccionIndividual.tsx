'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { accionElegirAlAzar, accionMarcarElegida } from '@/app/acciones';
import { Boton } from '@/components/Boton';
import { filtrarPendientes, type FiltrosNoche } from '@/lib/noche';
import type { Pendiente } from '@/db/queries';
import { FiltrosSorteo } from './FiltrosSorteo';
import { Ruleta } from './Ruleta';

const GIRO_MS = 1500;

/**
 * El modo individual: un celular, el dado. Los filtros acotan y se ve cuántas
 * quedan; «Tirar» sortea en el servidor mientras la ruleta gira acá. Con el
 * resultado, «Que sea esta» la deja como la de esta noche, o «Otra» tira de nuevo.
 */
export function EleccionIndividual({ pendientes }: { pendientes: Pendiente[] }) {
  const router = useRouter();
  const [filtros, setFiltros] = useState<FiltrosNoche>({});
  const [resultado, setResultado] = useState<Pendiente | null>(null);
  const [girando, setGirando] = useState(false);
  const [confirmando, empezar] = useTransition();

  const candidatas = useMemo(() => filtrarPendientes(pendientes, filtros), [pendientes, filtros]);

  async function tirar() {
    if (girando || candidatas.length === 0) return;
    setGirando(true);
    const [r] = await Promise.all([
      accionElegirAlAzar(filtros),
      new Promise((listo) => setTimeout(listo, GIRO_MS)),
    ]);
    setGirando(false);
    if ('error' in r) {
      toast(r.error);
      return;
    }
    setResultado(pendientes.find((p) => p.id === r.entradaId) ?? null);
  }

  function confirmar() {
    if (!resultado) return;
    empezar(async () => {
      await accionMarcarElegida(resultado.id);
      router.push('/pendientes');
    });
  }

  function cambiarFiltros(f: FiltrosNoche) {
    setFiltros(f);
    setResultado(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <FiltrosSorteo pendientes={pendientes} filtros={filtros} onCambio={cambiarFiltros} deshabilitado={girando} />

      <p className="text-sm text-tinta-suave" aria-live="polite">
        {candidatas.length === 0
          ? 'No queda ninguna con esos filtros.'
          : candidatas.length === 1
            ? 'Una sola candidata: no hay mucho que sortear.'
            : `${candidatas.length} candidatas`}
      </p>

      <Ruleta candidatas={candidatas} resultado={resultado} girando={girando} />

      <div className="min-h-16 text-center" aria-live="polite">
        {resultado && !girando && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-titulo text-3xl leading-tight text-tinta">{resultado.titulo}</p>
            <p className="text-sm text-tinta-suave">
              {[resultado.anio, resultado.duracionMin && `${resultado.duracionMin} min`, resultado.generos[0]]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {resultado && !girando ? (
          <>
            <Boton onClick={confirmar} disabled={confirmando} className="h-11 px-6">
              {confirmando ? 'Anotando…' : 'Que sea esta'}
            </Boton>
            <Boton variante="secundario" onClick={tirar} disabled={confirmando} className="h-11">
              Otra
            </Boton>
          </>
        ) : (
          <Boton onClick={tirar} disabled={girando || candidatas.length === 0} className="h-11 px-6">
            {girando ? 'Girando…' : 'Tirar el dado'}
          </Boton>
        )}
      </div>
    </div>
  );
}
