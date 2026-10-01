import type { RespuestaNoche } from '@/app/acciones';
import type { NochePublica } from '@/lib/noche';
import type { Persona } from '@/lib/personas';

/** Manda una acción al servidor y adopta la fila que vuelve (o avisa el error). */
export type Enviar = (accion: () => Promise<RespuestaNoche>) => Promise<void>;

/** Lo que toda pantalla de la sesión necesita: la fila, los dos y cómo mover. */
export type Mesa = {
  noche: NochePublica;
  yo: Persona;
  otro: Persona;
  /** En el orden de la sesión: primero quien la abrió. */
  jugadores: [string, string];
  enviar: Enviar;
  ocupado: boolean;
};

/** La persona de un id, para pintar con su color. */
export const personaDe = (mesa: Pick<Mesa, 'yo' | 'otro'>, id: string | null | undefined) =>
  id === mesa.yo.id ? mesa.yo : id === mesa.otro.id ? mesa.otro : null;

/** «vos» o el nombre, según quién. */
export const nombreDe = (mesa: Pick<Mesa, 'yo' | 'otro'>, id: string | null | undefined) =>
  id === mesa.yo.id ? 'vos' : (personaDe(mesa, id)?.nombre ?? 'alguien');
