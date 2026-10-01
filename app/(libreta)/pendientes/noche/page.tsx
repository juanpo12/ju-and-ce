import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { exigirPerfil } from '@/lib/sesion';
import { personasDe } from '@/lib/personas';
import { esDemo } from '@/lib/demo';
import { JUEGOS } from '@/lib/noche';
import { fichasParaJuegos, listarPendientes, nocheReciente } from '@/db/queries';
import { porQueNoSePuede } from '@/lib/juegos/indice';
import type { Juego } from '@/lib/noche';
import { Vacio } from '@/components/Vacio';
import { BotonLink } from '@/components/Boton';
import { ElegirModo } from './ElegirModo';
import { EleccionIndividual } from './EleccionIndividual';
import { SesionNoche } from './SesionNoche';

export const metadata = { title: 'Noche de peli — Nuestra libreta' };

/**
 * Elegir qué ver. Tres pantallas según el caso: si hay una sesión viva, se
 * entra directo; si no, se elige el modo, y el individual es el sorteo.
 */
export default async function Noche({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const perfil = await exigirPerfil();
  const { yo, otro } = personasDe(perfil);
  const { modo } = await searchParams;

  // De a dos hace falta la otra persona y Supabase del otro lado (Realtime).
  const deADos = Boolean(otro) && !esDemo;
  const motivo = !otro
    ? 'Primero invitá a la otra persona desde Ajustes.'
    : esDemo
      ? 'En la demo no hay Realtime: necesita Supabase del otro lado.'
      : null;

  const [pendientes, sesion, vistas] = await Promise.all([
    listarPendientes(perfil.id),
    deADos ? nocheReciente(perfil.id) : null,
    deADos ? fichasParaJuegos(perfil.id) : null,
  ]);

  const cabecera = (
    <header className="mb-5">
      <Link
        href="/pendientes"
        className="foco -ml-1 inline-flex items-center gap-1 rounded-sm text-sm text-tinta-suave hover:text-acento"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Pendientes
      </Link>
      <h1 className="mt-1 font-titulo text-5xl leading-none text-tinta md:text-6xl">Noche de peli</h1>
    </header>
  );

  if (sesion && otro && vistas) {
    const disponibilidad = Object.fromEntries(
      JUEGOS.map((j) => [j, porQueNoSePuede(j, vistas)]),
    ) as Record<Juego, string | null>;
    return (
      <>
        {cabecera}
        <SesionNoche
          inicial={sesion}
          yo={yo}
          otro={otro}
          espacioId={perfil.espacioId}
          pendientes={pendientes}
          disponibilidad={disponibilidad}
        />
      </>
    );
  }

  if (pendientes.length === 0) {
    return (
      <>
        {cabecera}
        <Vacio
          dibujo="entrada"
          titulo="No hay de dónde elegir"
          texto="Sumá alguna pendiente y volvé: el dado necesita opciones."
          accion={<BotonLink href="/agregar">Sumar una</BotonLink>}
        />
      </>
    );
  }

  if (modo === 'solo') {
    return (
      <>
        {cabecera}
        <EleccionIndividual pendientes={pendientes} />
      </>
    );
  }

  return (
    <>
      {cabecera}
      <ElegirModo deADos={deADos} motivo={motivo} otro={otro} />
    </>
  );
}
