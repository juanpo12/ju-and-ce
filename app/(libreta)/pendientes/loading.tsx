import { Skeleton } from '@/components/ui/skeleton';

export default function CargandoPendientes() {
  return (
    <div aria-busy aria-label="Cargando pendientes">
      <Skeleton className="mb-2 h-12 w-56 rounded-tema" />
      <Skeleton className="mb-5 h-4 w-28" />
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="tarjeta flex items-center gap-3 p-2.5 pr-3">
            <Skeleton className="aspect-[2/3] w-16 shrink-0 rounded-[calc(var(--radio)-4px)] sm:w-20" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
