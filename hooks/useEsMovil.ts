'use client';

import { useSyncExternalStore } from 'react';

const CONSULTA = '(max-width: 767px)';

function suscribir(avisar: () => void) {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener('change', avisar);
  return () => mq.removeEventListener('change', avisar);
}

/**
 * Por debajo de `md`. En el servidor no se sabe: devuelve true, porque la app se
 * usa sobre todo desde el celular y es el caso que conviene acertar.
 */
export function useEsMovil() {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA).matches,
    () => true,
  );
}
