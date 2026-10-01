'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { crearClienteServidor } from '@/lib/supabase/server';
import { clienteAdmin } from '@/lib/supabase/admin';
import { traerFicha } from '@/lib/tmdb';
import { esDemo } from '@/lib/demo';
import type { Tipo } from '@/db/schema';
import {
  borrarEntrada,
  borrarPuntaje,
  buscarNoche,
  crearEntrada,
  crearInvitacion,
  crearNoche,
  editarEntrada,
  fichasParaJuegos,
  guardarAjustes,
  guardarFicha,
  guardarPuntaje,
  invitacionValida,
  liberarInvitacion,
  listarPendientes,
  marcarComoVista,
  marcarElegida,
  registrarEleccionIndividual,
  reservarInvitacion,
  sumarAlEspacio,
  transicionarNoche,
  type Transicion,
} from '@/db/queries';
import {
  elOtro,
  estaViva,
  filtrarPendientes,
  filtrosValidos,
  type Candidata,
  type FiltrosNoche,
  type Juego,
  type JugadaDeJuego,
  type NochePublica,
} from '@/lib/noche';
import { JUEGOS } from '@/lib/noche';
import { azarSeguro, elegirUno } from '@/lib/juegos/azar';
import {
  aplicarJugada,
  desempatar,
  esJugadaValida,
  ErrorDeJuego,
  iniciarPartida,
} from '@/lib/juegos/indice';

/**
 * Las mutaciones. Todas pasan por `exigirPerfil()` y de ahí a `comoUsuario()`,
 * así que atraviesan la RLS igual que si vinieran del navegador: el id del
 * usuario sale de la sesión, nunca del formulario.
 */

/** Los mismos que acepta el check de `perfiles.tema` en la base. */
const TEMAS = ['papel', 'bullet', 'menta', 'hadas', 'pradera', 'acuarela', 'dragon', 'hongo', 'mariposas', 'campanitas'];

function refrescar(...rutas: string[]) {
  for (const r of ['/', '/pendientes', '/resumen', ...rutas]) revalidatePath(r);
}

export async function accionPuntuar(
  entradaId: string,
  estrellas: number,
  comentario: string | null,
) {
  const perfil = await exigirPerfil();
  if (!(estrellas >= 0.5 && estrellas <= 5)) throw new Error('Puntaje fuera de rango');

  await guardarPuntaje(perfil.id, entradaId, estrellas, comentario?.trim() || null);
  refrescar(`/peli/${entradaId}`);
}

export async function accionBorrarPuntaje(entradaId: string) {
  const perfil = await exigirPerfil();
  await borrarPuntaje(perfil.id, entradaId);
  refrescar(`/peli/${entradaId}`);
}

export async function accionAgregar(datos: {
  tmdbId: number;
  tipo: Tipo;
  estado: 'vista' | 'pendiente';
  vistaEl?: string | null;
  lugar?: string | null;
}) {
  const perfil = await exigirPerfil();

  // La ficha tiene que existir antes que la entrada: `entradas.tmdb_id` la
  // referencia. Esto ya corre en el servidor, así que va derecho a TMDB — pasar
  // por /api/peliculas sería un request HTTP de la app a sí misma.
  await guardarFicha(await traerFicha(datos.tmdbId, datos.tipo));

  const id = await crearEntrada(perfil.id, perfil.espacioId, datos);
  refrescar();
  return id;
}

export async function accionMarcarVista(entradaId: string, formData?: FormData) {
  const perfil = await exigirPerfil();
  await marcarComoVista(perfil.id, entradaId, {
    vistaEl: (formData?.get('vista_el') as string) || null,
    lugar: (formData?.get('lugar') as string) || null,
  });
  refrescar(`/peli/${entradaId}`);
}

export async function accionEditarEntrada(entradaId: string, formData: FormData) {
  const perfil = await exigirPerfil();
  await editarEntrada(perfil.id, entradaId, {
    vistaEl: (formData.get('vista_el') as string) || null,
    lugar: (formData.get('lugar') as string) || null,
  });
  refrescar(`/peli/${entradaId}`);
}

export async function accionBorrarEntrada(entradaId: string) {
  const perfil = await exigirPerfil();
  await borrarEntrada(perfil.id, entradaId);
  refrescar();
  redirect('/');
}

export async function accionGuardarAjustes(formData: FormData) {
  const perfil = await exigirPerfil();
  const nombre = (formData.get('nombre') as string)?.trim();
  const tema = formData.get('tema') as string;

  await guardarAjustes(perfil.id, {
    ...(nombre ? { nombre } : {}),
    ...(TEMAS.includes(tema) ? { tema } : {}),
  });
  // El tema vive en el <html> del layout raíz, así que hay que revalidar todo.
  revalidatePath('/', 'layout');
}

/**
 * El link para que la otra persona se sume. Se manda una sola vez: con eso crea
 * su cuenta y queda adentro. Si la libreta ya tiene a los dos, no hay link.
 */
export async function accionInvitar(): Promise<string> {
  const perfil = await exigirPerfil();
  if (perfil.companero) throw new Error('La libreta ya tiene a los dos');

  const token = await crearInvitacion(perfil.id, perfil.espacioId);
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const protocolo = h.get('x-forwarded-proto') ?? 'https';
  return `${protocolo}://${host}/unirse/${token}`;
}

/**
 * El canje: crea la cuenta con la clave secreta (el registro público está
 * apagado, así que es la única puerta), la suma al espacio y deja la sesión
 * abierta. Si algo falla a mitad de camino, deshace lo hecho y el link sigue
 * sirviendo.
 */
export async function accionUnirse(
  token: string,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const mail = String(formData.get('mail') ?? '').trim().toLowerCase();
  const clave = String(formData.get('clave') ?? '');

  if (!nombre) return { error: 'Falta tu nombre.' };
  if (!mail.includes('@')) return { error: 'Ese mail no parece válido.' };
  if (clave.length < 8) return { error: 'La contraseña tiene que tener al menos 8 caracteres.' };

  const invitacion = await invitacionValida(token);
  if (!invitacion || !(await reservarInvitacion(invitacion.id))) {
    return { error: 'Esta invitación ya se usó o venció. Pedí una nueva.' };
  }

  const admin = clienteAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email: mail,
    password: clave,
    email_confirm: true,
  });
  if (error || !data.user) {
    await liberarInvitacion(invitacion.id);
    return {
      error: /already|registered|exists/i.test(error?.message ?? '')
        ? 'Ya hay una cuenta con ese mail.'
        : 'No pudimos crear la cuenta. Probá de nuevo.',
    };
  }

  try {
    await sumarAlEspacio(data.user.id, invitacion.espacioId, nombre);
  } catch (e) {
    console.error('[unirse] no se pudo crear el perfil', e);
    await admin.auth.admin.deleteUser(data.user.id);
    await liberarInvitacion(invitacion.id);
    return { error: 'No pudimos sumarte a la libreta. Probá de nuevo.' };
  }

  const supabase = await crearClienteServidor();
  await supabase.auth.signInWithPassword({ email: mail, password: clave });
  redirect('/');
}

export async function accionSalir() {
  if (esDemo) return;

  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect('/entrar');
}

/* ------------------------------ noche de peli ---------------------------- */

export type RespuestaNoche = { noche: NochePublica } | { error: string };

/**
 * Las reglas del juego se rompen seguido y no es un bug: la jugada llegó tarde,
 * no era tu turno, la palabra no existe. Eso vuelve como `{ error }` y la
 * pantalla lo dice. Lo demás sí explota.
 */
async function conReglas(fn: () => Promise<NochePublica>): Promise<RespuestaNoche> {
  try {
    return { noche: await fn() };
  } catch (e) {
    if (e instanceof ErrorDeJuego) return { error: e.message };
    if (e instanceof Error && /ya no (existe|está)|No se pudo/.test(e.message)) return { error: e.message };
    throw e;
  }
}

/** Los dos de la sesión, en el orden en que entraron: primero quien la abrió. */
function jugadoresDe(noche: { creadaPor: string; estado: { presentes?: string[] } }): [string, string] {
  const otro = (noche.estado.presentes ?? []).find((p) => p !== noche.creadaPor);
  if (!otro) throw new ErrorDeJuego('Todavía falta que entre el otro.');
  return [noche.creadaPor, otro];
}

async function exigirPareja() {
  const perfil = await exigirPerfil();
  if (esDemo) throw new ErrorDeJuego('La sesión de a dos necesita Supabase: en la demo no hay Realtime.');
  if (!perfil.companero) throw new ErrorDeJuego('Para jugar de a dos, primero invitá a la otra persona.');
  return perfil;
}

/** Modo individual: la app sortea una pendiente. No deja rastro hasta que se confirma. */
export async function accionElegirAlAzar(filtros: FiltrosNoche): Promise<{ entradaId: string } | { error: string }> {
  const perfil = await exigirPerfil();
  const candidatas = filtrarPendientes(await listarPendientes(perfil.id), filtrosValidos(filtros));
  if (candidatas.length === 0) return { error: 'No queda ninguna con esos filtros.' };
  return { entradaId: elegirUno(candidatas, azarSeguro()).id };
}

/** «Que sea esta»: queda como la de esta noche y se anota en el historial. */
export async function accionMarcarElegida(entradaId: string) {
  const perfil = await exigirPerfil();
  await registrarEleccionIndividual(perfil.id, perfil.espacioId, entradaId);
  refrescar('/pendientes/noche');
}

export async function accionSoltarElegida() {
  const perfil = await exigirPerfil();
  await marcarElegida(perfil.id, perfil.espacioId, null);
  refrescar('/pendientes/noche');
}

export async function accionCrearNoche(): Promise<RespuestaNoche> {
  return conReglas(async () => {
    const perfil = await exigirPareja();
    const noche = await crearNoche(perfil.id, perfil.espacioId);
    refrescar('/pendientes/noche');
    return noche;
  });
}

export async function accionLeerNoche(id: string): Promise<NochePublica | null> {
  const perfil = await exigirPerfil();
  return buscarNoche(perfil.id, id);
}

/** El segundo celular entra: la sesión pasa a pedir candidatas. */
export async function accionUnirseANoche(id: string): Promise<RespuestaNoche> {
  return conReglas(async () => {
    const perfil = await exigirPareja();
    return transicionarNoche(perfil.id, id, (noche) => {
      const presentes = noche.estado.presentes ?? [];
      if (presentes.includes(perfil.id)) return { cambios: {} };
      if (noche.fase !== 'esperando') throw new ErrorDeJuego('Esa sesión ya arrancó sin vos.');
      return {
        cambios: { fase: 'candidatas', estado: { ...noche.estado, presentes: [...presentes, perfil.id] } },
      };
    });
  });
}

/**
 * Cada uno propone la suya: una de la lista o al azar. Con las dos puestas, si
 * coinciden ya está; si no, hay que jugar.
 */
export async function accionProponerCandidata(
  id: string,
  eleccion: { como: 'elijo'; entradaId: string } | { como: 'azar'; filtros?: FiltrosNoche },
): Promise<RespuestaNoche> {
  return conReglas(async () => {
    const perfil = await exigirPareja();
    // Antes de la transacción: en la demo hay una sola conexión y una query
    // adentro de otra se traba.
    const pendientes = await listarPendientes(perfil.id);

    return transicionarNoche(perfil.id, id, (noche) => {
      if (noche.fase !== 'candidatas') throw new ErrorDeJuego('Ahora no es momento de proponer.');
      const jugadores = jugadoresDe(noche);
      const candidatas = { ...(noche.estado.candidatas ?? {}) };

      let mia: Candidata;
      if (eleccion.como === 'elijo') {
        if (!pendientes.some((p) => p.id === eleccion.entradaId)) {
          throw new ErrorDeJuego('Esa película no está en pendientes.');
        }
        mia = { entradaId: eleccion.entradaId, como: 'elijo' };
      } else {
        const posibles = filtrarPendientes(pendientes, filtrosValidos(eleccion.filtros));
        if (posibles.length === 0) throw new ErrorDeJuego('No queda ninguna con esos filtros.');
        mia = { entradaId: elegirUno(posibles, azarSeguro()).id, como: 'azar' };
      }
      candidatas[perfil.id] = mia;

      const otro = elOtro(jugadores, perfil.id);
      const suya = candidatas[otro];
      if (!suya) return { cambios: { estado: { ...noche.estado, candidatas } } };

      if (suya.entradaId === mia.entradaId) {
        return {
          cambios: { fase: 'terminada', ganadorId: null, entradaId: mia.entradaId, estado: { ...noche.estado, candidatas } },
          elegida: mia.entradaId,
        };
      }
      return { cambios: { fase: 'juego', estado: { ...noche.estado, candidatas } } };
    }).then((noche) => {
      if (noche.fase === 'terminada') refrescar('/pendientes/noche');
      return noche;
    });
  });
}

/** Con qué se define. El primero que toca elige; empieza el otro. */
export async function accionElegirJuego(id: string, juego: Juego): Promise<RespuestaNoche> {
  return conReglas(async () => {
    const perfil = await exigirPareja();
    if (!JUEGOS.includes(juego)) throw new ErrorDeJuego('Ese juego no existe.');
    const { fichas, titulos } = await fichasParaJuegos(perfil.id);

    return transicionarNoche(perfil.id, id, (noche) => {
      if (noche.fase !== 'juego') throw new ErrorDeJuego('Ya se eligió el juego.');
      const jugadores = jugadoresDe(noche);
      const inicio = iniciarPartida(
        juego,
        { jugadores, empieza: elOtro(jugadores, perfil.id), fichas, titulos },
        azarSeguro(),
      );
      const estado = { ...noche.estado, partida: inicio.partida };
      if (inicio.fin) {
        const entradaId = noche.estado.candidatas?.[inicio.fin.ganadorId]?.entradaId;
        return {
          cambios: { fase: 'terminada', juego, estado, secreto: {}, ganadorId: inicio.fin.ganadorId, entradaId },
          elegida: entradaId,
        };
      }
      return { cambios: { fase: 'jugando', juego, estado, secreto: inicio.secreto } };
    }).then((noche) => {
      if (noche.fase === 'terminada') refrescar('/pendientes/noche');
      return noche;
    });
  });
}

export async function accionJugar(id: string, jugada: JugadaDeJuego): Promise<RespuestaNoche> {
  return conReglas(async () => {
    const perfil = await exigirPareja();
    if (!esJugadaValida(jugada)) throw new ErrorDeJuego('Esa jugada no tiene forma de jugada.');

    return transicionarNoche(perfil.id, id, (noche): Transicion => {
      if (noche.fase !== 'jugando' || !noche.estado.partida) throw new ErrorDeJuego('No hay partida en curso.');
      const jugadores = jugadoresDe(noche);
      const r = aplicarJugada(noche.estado.partida, noche.secreto, perfil.id, jugada, jugadores);

      if (!r.fin) {
        return { cambios: { estado: { ...noche.estado, partida: r.partida }, secreto: r.secreto } };
      }
      const empate = r.fin.ganadorId === null;
      const ganadorId = r.fin.ganadorId ?? desempatar(jugadores, azarSeguro());
      const entradaId = noche.estado.candidatas?.[ganadorId]?.entradaId;
      return {
        cambios: {
          fase: 'terminada',
          ganadorId,
          entradaId,
          secreto: {},
          estado: {
            ...noche.estado,
            partida: r.partida,
            ...(empate ? { desempate: { resultado: ganadorId } } : {}),
          },
        },
        elegida: entradaId,
      };
    }).then((noche) => {
      if (noche.fase === 'terminada') refrescar('/pendientes/noche');
      return noche;
    });
  });
}

export async function accionCancelarNoche(id: string): Promise<RespuestaNoche> {
  return conReglas(async () => {
    const perfil = await exigirPareja();
    const noche = await transicionarNoche(perfil.id, id, (noche) => {
      if (!estaViva(noche.fase)) return { cambios: {} };
      return { cambios: { fase: 'cancelada', secreto: {}, estado: { ...noche.estado, cerradaPor: perfil.id } } };
    });
    refrescar('/pendientes/noche');
    return noche;
  });
}
