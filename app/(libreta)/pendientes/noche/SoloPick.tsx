'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { pickRandomAction, setPickedAction } from '@/app/acciones';
import { Boton } from '@/components/Boton';
import { filterPending, type DrawFilters } from '@/lib/movie-night';
import type { Pendiente } from '@/db/queries';
import { FilterChips } from './FilterChips';
import { Roulette } from './Roulette';

const SPIN_MS = 1500;

/**
 * Solo mode: one phone, the die. The filters narrow the list and show how
 * many remain; "Tirar" draws on the server while the roulette spins here.
 * With a result, "Que sea esta" sets it as tonight's pick, or "Otra" rolls again.
 */
export function SoloPick({ pending }: { pending: Pendiente[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState<DrawFilters>({});
  const [result, setResult] = useState<Pendiente | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [confirming, start] = useTransition();

  const candidates = useMemo(() => filterPending(pending, filters), [pending, filters]);

  async function roll() {
    if (spinning || candidates.length === 0) return;
    setSpinning(true);
    const [r] = await Promise.all([
      pickRandomAction(filters),
      new Promise((done) => setTimeout(done, SPIN_MS)),
    ]);
    setSpinning(false);
    if ('error' in r) {
      toast(r.error);
      return;
    }
    setResult(pending.find((p) => p.id === r.entryId) ?? null);
  }

  function confirm() {
    if (!result) return;
    start(async () => {
      await setPickedAction(result.id);
      router.push('/pendientes');
    });
  }

  function changeFilters(f: DrawFilters) {
    setFilters(f);
    setResult(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <FilterChips pending={pending} filters={filters} onChange={changeFilters} disabled={spinning} />

      <p className="text-sm text-tinta-suave" aria-live="polite">
        {candidates.length === 0
          ? 'No queda ninguna con esos filtros.'
          : candidates.length === 1
            ? 'Una sola candidata: no hay mucho que sortear.'
            : `${candidates.length} candidatas`}
      </p>

      <Roulette candidates={candidates} result={result} spinning={spinning} />

      <div className="min-h-16 text-center" aria-live="polite">
        {result && !spinning && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-titulo text-3xl leading-tight text-tinta">{result.titulo}</p>
            <p className="text-sm text-tinta-suave">
              {[result.anio, result.duracionMin && `${result.duracionMin} min`, result.generos[0]]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {result && !spinning ? (
          <>
            <Boton onClick={confirm} disabled={confirming} className="h-11 px-6">
              {confirming ? 'Anotando…' : 'Que sea esta'}
            </Boton>
            <Boton variante="secundario" onClick={roll} disabled={confirming} className="h-11">
              Otra
            </Boton>
          </>
        ) : (
          <Boton onClick={roll} disabled={spinning || candidates.length === 0} className="h-11 px-6">
            {spinning ? 'Girando…' : 'Tirar el dado'}
          </Boton>
        )}
      </div>
    </div>
  );
}
