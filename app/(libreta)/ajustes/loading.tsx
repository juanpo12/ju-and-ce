import { Skeleton } from '@/components/ui/skeleton';

export default function CargandoAjustes() {
  return (
    <div aria-busy className="max-w-lg">
      <Skeleton className="mb-2 h-12 w-40 rounded-tema" />
      <Skeleton className="mb-5 h-4 w-24" />
      <Skeleton className="h-80 rounded-tema" />
      <Skeleton className="mt-4 h-28 rounded-tema" />
    </div>
  );
}
