'use client';

import { useEsMovil } from '@/hooks/useEsMovil';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

/**
 * En el celular, una hoja que sube desde abajo y se cierra deslizándola: queda
 * al alcance del pulgar. En la compu, un diálogo centrado. Mismo contenido.
 */
export function DialogoAdaptable({
  abierto,
  onCambio,
  titulo,
  descripcion,
  children,
}: {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  children: React.ReactNode;
}) {
  const movil = useEsMovil();

  if (movil) {
    return (
      <Drawer open={abierto} onOpenChange={onCambio}>
        <DrawerContent>
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="font-titulo text-3xl font-bold leading-tight text-tinta">
              {titulo}
            </DrawerTitle>
            {descripcion ? (
              <DrawerDescription>{descripcion}</DrawerDescription>
            ) : (
              <DrawerDescription className="sr-only">{titulo}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-5">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-titulo text-3xl font-bold leading-tight text-tinta">
            {titulo}
          </DialogTitle>
          {descripcion ? (
            <DialogDescription>{descripcion}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{titulo}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
