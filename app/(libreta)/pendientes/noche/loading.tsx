import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingNight() {
  return (
    <div aria-busy aria-label="Cargando la noche de peli">
      <Skeleton className="mb-2 h-4 w-20" />
      <Skeleton className="mb-6 h-12 w-64 rounded-tema" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-tema" />
        <Skeleton className="h-40 rounded-tema" />
      </div>
    </div>
  );
}
