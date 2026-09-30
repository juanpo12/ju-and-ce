import { Skeleton } from '@/components/ui/skeleton';

export default function CargandoAgregar() {
  return (
    <div aria-busy className="mx-auto max-w-2xl">
      <Skeleton className="mb-2 h-12 w-44 rounded-tema" />
      <Skeleton className="mb-5 h-4 w-72 max-w-full" />
      <Skeleton className="h-[3.25rem] w-full rounded-full" />
    </div>
  );
}
