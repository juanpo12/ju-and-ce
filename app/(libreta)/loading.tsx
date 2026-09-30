import { Skeleton } from '@/components/ui/skeleton';

/**
 * El esqueleto de la biblioteca mientras el servidor lee. Tiene la misma forma
 * que la grilla para que no haya salto de layout cuando llegan los datos.
 */
export default function Cargando() {
  return (
    <div aria-busy aria-label="Cargando la biblioteca">
      <Skeleton className="mb-2 h-12 w-56 rounded-tema" />
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="flex gap-2 overflow-hidden">
        {[28, 36, 30, 32].map((w, i) => (
          <Skeleton key={i} className="h-9 shrink-0 rounded-full" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 md:gap-y-7 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-[2/3] w-full rounded-tema" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
