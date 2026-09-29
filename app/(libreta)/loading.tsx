/**
 * El esqueleto mientras el servidor lee. Tiene la misma forma que la grilla para
 * que no haya salto de layout cuando llegan los datos.
 */
export default function Cargando() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-10 w-52 rounded-tema bg-acento-suave" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="tarjeta overflow-hidden">
            <div className="aspect-[2/3] w-full bg-acento-suave" />
            <div className="flex flex-col gap-2 p-2.5">
              <div className="h-4 w-4/5 rounded bg-acento-suave" />
              <div className="h-3 w-2/5 rounded bg-acento-suave" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
