import { Skeleton } from '@/components/ui/skeleton';

export default function CargandoResumen() {
  return (
    <div aria-busy aria-label="Cargando el resumen">
      <Skeleton className="mb-2 h-12 w-48 rounded-tema" />
      <Skeleton className="mb-5 h-4 w-24" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-tema" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-tema" />
        <Skeleton className="h-64 rounded-tema" />
      </div>
    </div>
  );
}
