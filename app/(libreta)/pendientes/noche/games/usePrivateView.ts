'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { privateViewAction } from '@/app/acciones';
import type { Table } from '../types';

/** Lets the simulator hand a screen its private view without a server. */
export const PrivateViewOverride = createContext<{ value: unknown } | null>(null);

/**
 * What only this player may see of the match (their dice, the word to draw),
 * fetched again every time the match moves. Null until it arrives.
 */
export function usePrivateView<T>(table: Table): T | null {
  const override = useContext(PrivateViewOverride);
  const { id, version } = table.night;
  const [view, setView] = useState<{ version: number; value: T } | null>(null);

  useEffect(() => {
    if (override) return;
    let current = true;
    void privateViewAction(id).then((value) => {
      if (current) setView({ version, value: value as T });
    });
    return () => {
      current = false;
    };
  }, [id, version, override]);

  if (override) return override.value as T | null;
  return view?.value ?? null;
}
