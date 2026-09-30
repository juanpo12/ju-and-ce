import { exigirPerfil } from '@/lib/sesion';
import { FormularioAjustes } from './FormularioAjustes';
import { BotonSalir } from './BotonSalir';
import { SelectorModo } from './SelectorModo';
import { Invitar } from './Invitar';
import { CambiarClave } from './CambiarClave';

export const metadata = { title: 'Ajustes — Nuestra libreta' };

export default async function Ajustes() {
  const perfil = await exigirPerfil();

  return (
    <div className="max-w-lg">
      <header className="mb-5">
        <h1 className="font-titulo text-4xl leading-none text-tinta md:text-5xl">Ajustes</h1>
        <p className="mt-1 text-sm text-tinta-suave">{perfil.espacioNombre}</p>
      </header>

      <FormularioAjustes nombre={perfil.nombre} tema={perfil.tema} />

      <div className="mt-4">
        <SelectorModo />
      </div>

      <section className="tarjeta mt-4 px-4 py-4">
        <h2 className="font-titulo text-2xl text-tinta">La otra persona</h2>
        {perfil.companero ? (
          <p className="mt-1 flex items-center gap-2 text-sm text-tinta-suave">
            <span className="size-2.5 rounded-full bg-menta" aria-hidden />
            {perfil.companero.nombre} comparte esta libreta con vos.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-tinta-suave">
              Todavía sos la única persona en esta libreta.
            </p>
            <Invitar />
          </>
        )}
      </section>

      <section className="tarjeta mt-4 px-4 py-4">
        <h2 className="font-titulo text-2xl text-tinta">Contraseña</h2>
        <CambiarClave />
      </section>

      <section className="tarjeta mt-4 px-4 py-4">
        <h2 className="font-titulo text-2xl text-tinta">Tenerla a mano</h2>
        <p className="mt-1 text-sm leading-relaxed text-tinta-suave">
          Se puede agregar al inicio del celular y queda con ícono propio, sin la barra del
          navegador. En iPhone: Safari → Compartir → «Agregar a inicio». En Android, Chrome lo
          ofrece solo.
        </p>
      </section>

      <div className="mt-4">
        <BotonSalir />
      </div>
    </div>
  );
}
