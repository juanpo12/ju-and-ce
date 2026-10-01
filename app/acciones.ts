'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { crearClienteServidor } from '@/lib/supabase/server';
import { clienteAdmin } from '@/lib/supabase/admin';
import { traerFicha } from '@/lib/tmdb';
import { esDemo } from '@/lib/demo';
import { TEMAS, type Tema } from '@/lib/temas';
import type { Tipo } from '@/db/schema';
import {
  borrarEntrada,
  borrarPuntaje,
  crearEntrada,
  crearInvitacion,
  createNight,
  editarEntrada,
  findNight,
  gameAssets,
  guardarAjustes,
  guardarFicha,
  guardarPuntaje,
  invitacionValida,
  liberarInvitacion,
  listarPendientes,
  marcarComoVista,
  recordSoloPick,
  reservarInvitacion,
  setPicked,
  sumarAlEspacio,
  transitionNight,
  type Transition,
} from '@/db/queries';
import {
  GAMES,
  filterPending,
  isLive,
  otherOf,
  validFilters,
  type Candidate,
  type DrawFilters,
  type Game,
  type Move,
  type PublicNight,
} from '@/lib/movie-night';
import { pickOne, secureRng } from '@/lib/games/random';
import { applyMove, GameError, isValidMove, startMatch, tiebreak } from '@/lib/games';

/**
 * Las mutaciones. Todas pasan por `exigirPerfil()` y de ahí a `comoUsuario()`,
 * así que atraviesan la RLS igual que si vinieran del navegador: el id del
 * usuario sale de la sesión, nunca del formulario.
 */


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
    // Los mismos que acepta el check de `perfiles.tema` en la base.
    ...(TEMAS.includes(tema as Tema) ? { tema } : {}),
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

/* ------------------------------- movie night ----------------------------- */

export type NightResponse = { night: PublicNight } | { error: string };

/**
 * Game rules get broken all the time and it is not a bug: the move arrived
 * late, it was not your turn, the word does not exist. That comes back as
 * `{ error }` and the screen says so. Everything else does blow up.
 */
async function withRules(fn: () => Promise<PublicNight>): Promise<NightResponse> {
  try {
    return { night: await fn() };
  } catch (e) {
    if (e instanceof GameError) return { error: e.message };
    if (e instanceof Error && /ya no (existe|está)|No se pudo/.test(e.message)) return { error: e.message };
    throw e;
  }
}

/** The two of the session, in the order they entered: whoever opened it first. */
function playersOf(night: { createdBy: string; state: { present?: string[] } }): [string, string] {
  const other = (night.state.present ?? []).find((p) => p !== night.createdBy);
  if (!other) throw new GameError('Todavía falta que entre el otro.');
  return [night.createdBy, other];
}

async function requirePartner() {
  const perfil = await exigirPerfil();
  if (esDemo) throw new GameError('La sesión de a dos necesita Supabase: en la demo no hay Realtime.');
  if (!perfil.companero) throw new GameError('Para jugar de a dos, primero invitá a la otra persona.');
  return perfil;
}

/** Solo mode: the app draws a pending entry. Leaves no trace until confirmed. */
export async function pickRandomAction(filters: DrawFilters): Promise<{ entryId: string } | { error: string }> {
  const perfil = await exigirPerfil();
  const candidates = filterPending(await listarPendientes(perfil.id), validFilters(filters));
  if (candidates.length === 0) return { error: 'No queda ninguna con esos filtros.' };
  return { entryId: pickOne(candidates, secureRng()).id };
}

/** "Que sea esta": it becomes tonight's pick and goes into the history. */
export async function setPickedAction(entryId: string) {
  const perfil = await exigirPerfil();
  await recordSoloPick(perfil.id, perfil.espacioId, entryId);
  refrescar('/pendientes/noche');
}

export async function clearPickedAction() {
  const perfil = await exigirPerfil();
  await setPicked(perfil.id, perfil.espacioId, null);
  refrescar('/pendientes/noche');
}

export async function createNightAction(): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    const night = await createNight(perfil.id, perfil.espacioId);
    refrescar('/pendientes/noche');
    return night;
  });
}

export async function readNightAction(id: string): Promise<PublicNight | null> {
  const perfil = await exigirPerfil();
  return findNight(perfil.id, id);
}

/** The second phone comes in: the session moves on to asking for candidates. */
export async function joinNightAction(id: string): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    return transitionNight(perfil.id, id, (night) => {
      const present = night.state.present ?? [];
      if (present.includes(perfil.id)) return { changes: {} };
      if (night.phase !== 'esperando') throw new GameError('Esa sesión ya arrancó sin vos.');
      return {
        changes: { phase: 'candidatas', state: { ...night.state, present: [...present, perfil.id] } },
      };
    });
  });
}

/**
 * Each one proposes theirs: one from the list, or at random. With both set, if
 * they match it is settled; otherwise there is a game to play.
 */
export async function proposeCandidateAction(
  id: string,
  choice: { how: 'picked'; entryId: string } | { how: 'random'; filters?: DrawFilters },
): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    // Before the transaction: the demo has a single connection and a query
    // inside another one deadlocks.
    const pending = await listarPendientes(perfil.id);

    return transitionNight(perfil.id, id, (night) => {
      if (night.phase !== 'candidatas') throw new GameError('Ahora no es momento de proponer.');
      const players = playersOf(night);
      const candidates = { ...(night.state.candidates ?? {}) };

      let mine: Candidate;
      if (choice.how === 'picked') {
        if (!pending.some((p) => p.id === choice.entryId)) {
          throw new GameError('Esa película no está en pendientes.');
        }
        mine = { entryId: choice.entryId, how: 'picked' };
      } else {
        const possible = filterPending(pending, validFilters(choice.filters));
        if (possible.length === 0) throw new GameError('No queda ninguna con esos filtros.');
        mine = { entryId: pickOne(possible, secureRng()).id, how: 'random' };
      }
      candidates[perfil.id] = mine;

      const other = otherOf(players, perfil.id);
      const theirs = candidates[other];
      if (!theirs) return { changes: { state: { ...night.state, candidates } } };

      if (theirs.entryId === mine.entryId) {
        return {
          changes: { phase: 'terminada', winnerId: null, entryId: mine.entryId, state: { ...night.state, candidates } },
          picked: mine.entryId,
        };
      }
      return { changes: { phase: 'juego', state: { ...night.state, candidates } } };
    }).then((night) => {
      if (night.phase === 'terminada') refrescar('/pendientes/noche');
      return night;
    });
  });
}

/** What settles it. The first one to tap chooses; the other one starts. */
export async function chooseGameAction(id: string, game: Game): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    if (!GAMES.includes(game)) throw new GameError('Ese juego no existe.');
    const assets = await gameAssets(perfil.id);
    const names = { [perfil.id]: perfil.nombre, [perfil.companero!.id]: perfil.companero!.nombre };

    return transitionNight(perfil.id, id, (night) => {
      if (night.phase !== 'juego') throw new GameError('Ya se eligió el juego.');
      const players = playersOf(night);
      const start = startMatch(
        game,
        { players, starter: otherOf(players, perfil.id), ...assets, names },
        secureRng(),
      );
      const state = { ...night.state, match: start.match };
      if (start.end) {
        const entryId = night.state.candidates?.[start.end.winnerId]?.entryId;
        return {
          changes: { phase: 'terminada', game, state, secret: {}, winnerId: start.end.winnerId, entryId },
          picked: entryId,
        };
      }
      return { changes: { phase: 'jugando', game, state, secret: start.secret } };
    }).then((night) => {
      if (night.phase === 'terminada') refrescar('/pendientes/noche');
      return night;
    });
  });
}

export async function playAction(id: string, move: Move): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    if (!isValidMove(move)) throw new GameError('Esa jugada no tiene forma de jugada.');

    return transitionNight(perfil.id, id, (night): Transition => {
      if (night.phase !== 'jugando' || !night.state.match) throw new GameError('No hay partida en curso.');
      const players = playersOf(night);
      const r = applyMove(night.state.match, night.secret, perfil.id, move, players, secureRng());

      if (!r.end) {
        return { changes: { state: { ...night.state, match: r.match }, secret: r.secret } };
      }
      const tied = r.end.winnerId === null;
      const winnerId = r.end.winnerId ?? tiebreak(players, secureRng());
      const entryId = night.state.candidates?.[winnerId]?.entryId;
      return {
        changes: {
          phase: 'terminada',
          winnerId,
          entryId,
          secret: {},
          state: {
            ...night.state,
            match: r.match,
            ...(tied ? { tiebreak: { result: winnerId } } : {}),
          },
        },
        picked: entryId,
      };
    }).then((night) => {
      if (night.phase === 'terminada') refrescar('/pendientes/noche');
      return night;
    });
  });
}

/** Giving up mid-game: the other one wins, and their candidate is the pick. */
export async function surrenderAction(id: string): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    return transitionNight(perfil.id, id, (night): Transition => {
      if (night.phase !== 'jugando') throw new GameError('No hay partida de la que rendirse.');
      const winnerId = otherOf(playersOf(night), perfil.id);
      const entryId = night.state.candidates?.[winnerId]?.entryId;
      return {
        changes: {
          phase: 'terminada',
          winnerId,
          entryId,
          secret: {},
          state: { ...night.state, surrenderedBy: perfil.id },
        },
        picked: entryId,
      };
    }).then((night) => {
      refrescar('/pendientes/noche');
      return night;
    });
  });
}

export async function cancelNightAction(id: string): Promise<NightResponse> {
  return withRules(async () => {
    const perfil = await requirePartner();
    const night = await transitionNight(perfil.id, id, (night) => {
      if (!isLive(night.phase)) return { changes: {} };
      return { changes: { phase: 'cancelada', secret: {}, state: { ...night.state, closedBy: perfil.id } } };
    });
    refrescar('/pendientes/noche');
    return night;
  });
}
