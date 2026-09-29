/** El estado vacío: una pantalla sin datos tiene que decir qué hacer, no quedar en blanco. */
export function Vacio({
  titulo,
  texto,
  accion,
}: {
  titulo: string;
  texto: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="tarjeta mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="font-titulo text-2xl text-tinta">{titulo}</p>
      <p className="text-sm leading-relaxed text-tinta-suave">{texto}</p>
      {accion}
    </div>
  );
}
