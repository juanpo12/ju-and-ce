'use client';

import { useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';

/**
 * Las listas que ya se vieron en esta visita, por URL. Volver de una ficha a la
 * biblioteca no repite la entrada escalonada: ahí lo que tiene que moverse es el
 * póster que vuelve a su lugar, y una grilla apareciendo de a una lo taparía.
 */
const vistas = new Set<string>();

const nada = () => () => {};

/**
 * Un <li> que entra subiendo, con un retraso según su posición.
 *
 * En la primera carga no anima: el HTML del servidor llega ya visible, y
 * esconderlo hasta hidratar sería peor que no animar. Durante la hidratación
 * `useSyncExternalStore` usa el valor del servidor (false), así que las dos
 * versiones coinciden. Anima cuando la lista aparece por navegación.
 */
export function ItemEscalonado({
  indice,
  className,
  children,
  ...datos
}: {
  indice: number;
  className?: string;
  children: React.ReactNode;
} & Record<`data-${string}`, string>) {
  const ruta = usePathname();
  const params = useSearchParams();
  const clave = `${ruta}?${params}`;
  const enCliente = useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
  const [yaVista] = useState(() => vistas.has(clave));
  // Se anota al renderizar, no en un efecto: los hermanos que se montan en el
  // mismo commit leen `yaVista` en su propio useState, que ya corrió.
  if (enCliente && indice === 0) queueMicrotask(() => vistas.add(clave));

  const animar = enCliente && !yaVista;

  return (
    <motion.li
      {...datos}
      className={className}
      initial={animar ? { opacity: 0, y: 14, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.2, 0.8, 0.2, 1],
        // Tope al retraso: con cuarenta pelis, la última no puede esperar 1,6 s.
        delay: Math.min(indice, 12) * 0.035,
      }}
    >
      {children}
    </motion.li>
  );
}
