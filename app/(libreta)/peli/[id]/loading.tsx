import { Skeleton } from '@/components/ui/skeleton';

/** La ficha mientras llega: póster, título y las dos hojas de puntaje. */
export default function CargandoFicha() {
  return (
    <div aria-busy aria-label="Cargando la película" className="flex flex-col gap-7">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="flex flex-col gap-7 md:flex-row md:gap-10">
        <Skeleton className="mx-auto aspect-[2/3] w-[58%] max-w-64 rounded-tema md:mx-0 md:w-72 md:max-w-none" />
        <div className="flex flex-1 flex-col items-center gap-3 md:items-start md:pt-2">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-20 w-full rounded-tema" />
          <div className="mt-4 grid w-full gap-3 sm:grid-cols-2">
            <Skeleton className="h-44 rounded-tema" />
            <Skeleton className="h-44 rounded-tema" />
          </div>
        </div>
      </div>
    </div>
  );
}
