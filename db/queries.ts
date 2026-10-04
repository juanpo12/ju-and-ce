import 'server-only';
import { cache } from 'react';
import { and, asc, count, desc, eq, getViewSelectedFields, gt, gte, inArray, isNotNull, isNull, lt, ne, not, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  comoUsuario,
  dbAdmin,
  entradas,
  espacios,
  invitaciones,
  nights,
  peliculas,
  perfiles,
  puntajes,
  vEntradasPuntuadas,
  vPorGenero,
  type EntradaPuntuada,
  type Night,
  type Perfil,
  type Tipo,
} from './index';
import { createHash, randomBytes } from 'node:crypto';
import { hoyISO, ZONA_LIBRETA } from '@/lib/fechas';
import { LIVE_PHASES, type Card, type Game, type LibraryEntry, type PublicNight } from '@/lib/movie-night';
import type { HangmanTitle } from '@/lib/games/hangman';

/* ---------------------------------------------------------------------------
   Todo el acceso a datos vive acá, no disperso entre componentes.

   Cada función que representa a un usuario pasa por `comoUsuario()`: abre una
   transacción con el rol `authenticated` y los claims del JWT, así las mismas
   políticas RLS que protegen al navegador protegen también al servidor. Nada
   depende de que nos acordemos de poner el `where` del espacio.
--------------------------------------------------------------------------- */

export type PerfilConCompanero = Perfil & {
  espacioNombre: string;
  companero: Pick<Perfil, 'id' | 'nombre' | 'color'> | null;
};

/**
 * El perfil del usuario y el de la otra persona del espacio. Corre en cada
 * pantalla, así que va en una sola query: el espacio y el compañero por join.
 */
export async function buscarPerfil(userId: string): Promise<PerfilConCompanero | null> {
  const companero = alias(perfiles, 'companero');
  return comoUsuario(userId, async (tx) => {
    const [fila] = await tx
      .select({
        yo: perfiles,
        espacioNombre: espacios.nombre,
        companero: { id: companero.id, nombre: companero.nombre, color: companero.color },
      })
      .from(perfiles)
      .leftJoin(espacios, eq(espacios.id, perfiles.espacioId))
      .leftJoin(
        companero,
        and(eq(companero.espacioId, perfiles.espacioId), ne(companero.id, perfiles.id)),
      )
      .where(eq(perfiles.id, userId))
      .limit(1);
    if (!fila) return null;

    return {
      ...fila.yo,
      espacioNombre: fila.espacioNombre ?? 'Nuestra libreta',
      companero: fila.companero,
    };
  });
}

/* --------------------------------- lecturas ------------------------------ */

export type Filtros = {
  genero?: string;
  anio?: number;
  puntajeMinimo?: number;
  orden?: 'recientes' | 'mejores' | 'titulo';
};

/** Una entrada con el puntaje y el comentario de cada uno, ya separados. */
export type EntradaConPuntajes = EntradaPuntuada & {
  mio: { estrellas: number; comentario: string | null } | null;
  suyo: { estrellas: number; comentario: string | null } | null;
};

/**
 * Separa los puntajes de una entrada en el mío y el del otro. Van aparte y no
 * con un `jsonb_agg` en la vista: con dos personas y unos cientos de películas
 * la diferencia no se mide, y esto se lee.
 */
function repartirPuntajes(
  fila: EntradaPuntuada,
  suyos: (typeof puntajes.$inferSelect)[],
  userId: string,
): EntradaConPuntajes {
  const mio = suyos.find((p) => p.perfilId === userId) ?? null;
  const otro = suyos.find((p) => p.perfilId !== userId) ?? null;
  return {
    ...fila,
    mio: mio && { estrellas: mio.estrellas, comentario: mio.comentario },
    suyo: otro && { estrellas: otro.estrellas, comentario: otro.comentario },
  };
}

/** La biblioteca: lo que ya vieron, con los filtros de la pantalla aplicados. */
export async function listarBiblioteca(
  userId: string,
  filtros: Filtros = {},
): Promise<EntradaConPuntajes[]> {
  return comoUsuario(userId, async (tx) => {
    const condiciones = [eq(vEntradasPuntuadas.estado, 'vista')];
    if (filtros.genero) {
      condiciones.push(sql`${filtros.genero} = any(${vEntradasPuntuadas.generos})`);
    }
    if (filtros.anio) condiciones.push(eq(vEntradasPuntuadas.anio, filtros.anio));
    if (filtros.puntajeMinimo) {
      condiciones.push(gte(vEntradasPuntuadas.promedio, filtros.puntajeMinimo));
    }

    const orden = {
      recientes: [desc(sql`coalesce(${vEntradasPuntuadas.vistaEl}, ${vEntradasPuntuadas.creadaEn}::date)`)],
      mejores: [desc(sql`${vEntradasPuntuadas.promedio} nulls last`)],
      titulo: [asc(vEntradasPuntuadas.titulo)],
    }[filtros.orden ?? 'recientes'];

    // Los puntajes de todo lo visto van en paralelo con las entradas, no
    // después: con dos personas son pocas filas, y se ahorra un viaje.
    const [filas, todos] = await Promise.all([
      tx
        .select()
        .from(vEntradasPuntuadas)
        .where(and(...condiciones))
        .orderBy(...orden),
      tx
        .select({ puntaje: puntajes })
        .from(puntajes)
        .innerJoin(entradas, eq(entradas.id, puntajes.entradaId))
        .where(eq(entradas.estado, 'vista')),
    ]);

    return filas.map((fila) =>
      repartirPuntajes(
        fila,
        todos.filter((t) => t.puntaje.entradaId === fila.id).map((t) => t.puntaje),
        userId,
      ),
    );
  });
}

/** La watchlist compartida: lo que falta ver, con quién la sumó. */
export async function listarPendientes(userId: string) {
  return comoUsuario(userId, async (tx) => {
    return tx
      .select({
        id: vEntradasPuntuadas.id,
        tmdbId: vEntradasPuntuadas.tmdbId,
        tipo: vEntradasPuntuadas.tipo,
        titulo: vEntradasPuntuadas.titulo,
        anio: vEntradasPuntuadas.anio,
        duracionMin: vEntradasPuntuadas.duracionMin,
        generos: vEntradasPuntuadas.generos,
        posterPath: vEntradasPuntuadas.posterPath,
        creadaEn: vEntradasPuntuadas.creadaEn,
        pickedAt: vEntradasPuntuadas.pickedAt,
        agregadaPor: vEntradasPuntuadas.agregadaPor,
        agregadaPorNombre: perfiles.nombre,
        agregadaPorColor: perfiles.color,
      })
      .from(vEntradasPuntuadas)
      .innerJoin(perfiles, eq(perfiles.id, vEntradasPuntuadas.agregadaPor))
      .where(eq(vEntradasPuntuadas.estado, 'pendiente'))
      .orderBy(desc(vEntradasPuntuadas.creadaEn));
  });
}

export type Pendiente = Awaited<ReturnType<typeof listarPendientes>>[number];

/**
 * La ficha completa de una entrada. Envuelta en `cache()` porque la pagina y su
 * `generateMetadata` la piden las dos: sin esto son dos viajes a la base por
 * cada carga de la ficha.
 */
export const buscarEntrada = cache(async (userId: string, entradaId: string) => {
  return comoUsuario(userId, async (tx) => {
    // Dos queries en paralelo en vez de cuatro en fila: la ficha y quién la
    // sumó vienen por join, y los puntajes no dependen de nada.
    const [[fila], suyos] = await Promise.all([
      tx
        .select({
          entrada: getViewSelectedFields(vEntradasPuntuadas),
          tituloOriginal: peliculas.tituloOriginal,
          director: peliculas.director,
          sinopsis: peliculas.sinopsis,
          agregadaPorNombre: perfiles.nombre,
        })
        .from(vEntradasPuntuadas)
        .leftJoin(
          peliculas,
          and(
            eq(peliculas.tmdbId, vEntradasPuntuadas.tmdbId),
            eq(peliculas.tipo, vEntradasPuntuadas.tipo),
          ),
        )
        .leftJoin(perfiles, eq(perfiles.id, vEntradasPuntuadas.agregadaPor))
        .where(eq(vEntradasPuntuadas.id, entradaId)),
      tx.select().from(puntajes).where(eq(puntajes.entradaId, entradaId)),
    ]);
    if (!fila) return null;

    const { entrada, agregadaPorNombre, ...ficha } = fila;
    return {
      ...repartirPuntajes(entrada, suyos, userId),
      ...ficha,
      agregadaPorNombre: agregadaPorNombre ?? null,
    };
  });
});

export type Ficha = NonNullable<Awaited<ReturnType<typeof buscarEntrada>>>;

/** Los números sueltos de la pantalla de resumen, en un solo round trip. */
export async function traerResumen(userId: string) {
  return comoUsuario(userId, async (tx) => {
    const filas = (await tx.execute(sql`select resumen() as r`)) as unknown as {
      r: { vistas: number; promedio: number | null; horas: number | null; coincidimos: number };
    }[];
    return filas[0]!.r;
  });
}

export async function contarPorGenero(userId: string) {
  return comoUsuario(userId, (tx) =>
    tx
      .select({ genero: vPorGenero.genero, cantidad: vPorGenero.cantidad })
      .from(vPorGenero)
      .orderBy(desc(vPorGenero.cantidad), asc(vPorGenero.genero)),
  );
}

/** Cuántas veces salió cada puntaje, para el histograma del resumen. */
export async function distribucionDePuntajes(userId: string) {
  return comoUsuario(userId, async (tx) => {
    const filas = await tx
      .select({
        estrellas: puntajes.estrellas,
        cantidad: sql<number>`count(*)::int`,
      })
      .from(puntajes)
      .groupBy(puntajes.estrellas)
      .orderBy(asc(puntajes.estrellas));
    return filas;
  });
}

/** Los años y géneros que de verdad hay en la libreta, para armar los filtros. */
export async function opcionesDeFiltro(userId: string) {
  return comoUsuario(userId, async (tx) => {
    const [generos, anios] = await Promise.all([
      tx
        .select({ genero: vPorGenero.genero })
        .from(vPorGenero)
        .orderBy(desc(vPorGenero.cantidad)),
      tx
        .selectDistinct({ anio: vEntradasPuntuadas.anio })
        .from(vEntradasPuntuadas)
        .where(eq(vEntradasPuntuadas.estado, 'vista'))
        .orderBy(desc(vEntradasPuntuadas.anio)),
    ]);
    return {
      generos: generos.map((g) => g.genero),
      anios: anios.map((a) => a.anio).filter((a): a is number => a !== null),
    };
  });
}

/** El id de TMDB solo no alcanza: una peli y una serie pueden compartirlo. */
export const claveFicha = (tmdbId: number, tipo: Tipo) => `${tipo}:${tmdbId}`;

/** Qué fichas ya están en la libreta: enciende «Ya está en la biblioteca». */
export async function fichasEnBiblioteca(userId: string): Promise<Set<string>> {
  return comoUsuario(userId, async (tx) => {
    const filas = await tx
      .select({ tmdbId: entradas.tmdbId, tipo: entradas.tipo })
      .from(entradas);
    return new Set(filas.map((f) => claveFicha(f.tmdbId, f.tipo)));
  });
}

/* -------------------------------- escrituras ----------------------------- */

/** Da de alta una película o serie en la libreta, como vista o como pendiente. */
export async function crearEntrada(
  userId: string,
  espacioId: string,
  datos: {
    tmdbId: number;
    tipo: Tipo;
    estado: 'vista' | 'pendiente';
    vistaEl?: string | null;
    lugar?: string | null;
  },
) {
  return comoUsuario(userId, async (tx) => {
    const [fila] = await tx
      .insert(entradas)
      .values({
        espacioId,
        tmdbId: datos.tmdbId,
        tipo: datos.tipo,
        estado: datos.estado,
        vistaEl: datos.estado === 'vista' ? (datos.vistaEl ?? hoy()) : null,
        lugar: datos.lugar || null,
        agregadaPor: userId,
      })
      // Si ya estaba, no explota: devolvemos la que había.
      .onConflictDoNothing({ target: [entradas.espacioId, entradas.tmdbId, entradas.tipo] })
      .returning({ id: entradas.id });

    if (fila) return fila.id;

    const [existente] = await tx
      .select({ id: entradas.id })
      .from(entradas)
      .where(and(eq(entradas.tmdbId, datos.tmdbId), eq(entradas.tipo, datos.tipo)));
    return existente!.id;
  });
}

/**
 * Puntuar es un upsert sobre la clave (entrada, perfil). El `perfil_id` sale del
 * usuario, no del formulario: la RLS lo rechazaría igual, pero conviene no
 * darle la oportunidad.
 */
export async function guardarPuntaje(
  userId: string,
  entradaId: string,
  estrellas: number,
  comentario: string | null,
) {
  return comoUsuario(userId, (tx) =>
    tx
      .insert(puntajes)
      .values({ entradaId, perfilId: userId, estrellas, comentario })
      .onConflictDoUpdate({
        target: [puntajes.entradaId, puntajes.perfilId],
        set: { estrellas, comentario, actualizadoEn: new Date() },
      }),
  );
}

export async function borrarPuntaje(userId: string, entradaId: string) {
  return comoUsuario(userId, (tx) =>
    tx
      .delete(puntajes)
      .where(and(eq(puntajes.entradaId, entradaId), eq(puntajes.perfilId, userId))),
  );
}

/** Pendiente → vista. Es un update de estado, no una fila nueva: así no se
 *  pierde quién la había sumado. */
export async function marcarComoVista(
  userId: string,
  entradaId: string,
  datos: { vistaEl?: string | null; lugar?: string | null } = {},
) {
  return comoUsuario(userId, (tx) =>
    tx
      .update(entradas)
      // If it was tonight's pick, it is no longer waiting for anyone.
      .set({ estado: 'vista', vistaEl: datos.vistaEl ?? hoy(), lugar: datos.lugar || null, pickedAt: null })
      .where(eq(entradas.id, entradaId)),
  );
}

export async function editarEntrada(
  userId: string,
  entradaId: string,
  datos: { vistaEl?: string | null; lugar?: string | null },
) {
  return comoUsuario(userId, (tx) =>
    tx.update(entradas).set(datos).where(eq(entradas.id, entradaId)),
  );
}

export async function borrarEntrada(userId: string, entradaId: string) {
  return comoUsuario(userId, (tx) => tx.delete(entradas).where(eq(entradas.id, entradaId)));
}

export async function guardarAjustes(
  userId: string,
  datos: { nombre?: string; tema?: string; color?: string },
) {
  return comoUsuario(userId, (tx) =>
    tx.update(perfiles).set(datos).where(eq(perfiles.id, userId)),
  );
}

/* ------------------------- solo servidor (sin RLS) ------------------------ */

/**
 * Guarda la ficha de TMDB. Va por `dbAdmin` a propósito: `peliculas` no tiene
 * política de escritura porque es una tabla global, no de nadie. El que escribe
 * es el route handler, nunca el navegador.
 */
export async function guardarFicha(ficha: typeof peliculas.$inferInsert) {
  await dbAdmin
    .insert(peliculas)
    .values(ficha)
    .onConflictDoUpdate({
      target: [peliculas.tmdbId, peliculas.tipo],
      set: { ...ficha, actualizadaEn: new Date() },
    });
}

export async function fichaGuardada(tmdbId: number, tipo: Tipo = 'pelicula') {
  const [fila] = await dbAdmin
    .select()
    .from(peliculas)
    .where(and(eq(peliculas.tmdbId, tmdbId), eq(peliculas.tipo, tipo)));
  return fila ?? null;
}

/* ------------------------------- invitaciones ----------------------------- */

/** Una libreta es de a dos: el esquema aguanta más, las pantallas no. */
const MAXIMO_POR_ESPACIO = 2;
const DIAS_INVITACION = 7;

const hashDe = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * Crea un link de un solo uso para sumarse al espacio y devuelve el token en
 * claro, que es lo único que no queda guardado. Invalida los anteriores sin
 * usar: vale solo el último que se mandó.
 */
export async function crearInvitacion(perfilId: string, espacioId: string) {
  const token = randomBytes(24).toString('base64url');
  await dbAdmin.transaction(async (tx) => {
    await tx
      .delete(invitaciones)
      .where(and(eq(invitaciones.espacioId, espacioId), isNull(invitaciones.usadaEn)));
    await tx.insert(invitaciones).values({
      espacioId,
      creadaPor: perfilId,
      tokenHash: hashDe(token),
      venceEn: new Date(Date.now() + DIAS_INVITACION * 86_400_000),
    });
  });
  return token;
}

export type InvitacionValida = { id: string; espacioId: string; espacioNombre: string; invita: string };

/** La invitación, si todavía sirve: sin usar, sin vencer y con lugar libre. */
export async function invitacionValida(token: string): Promise<InvitacionValida | null> {
  const [fila] = await dbAdmin
    .select({
      id: invitaciones.id,
      espacioId: invitaciones.espacioId,
      espacioNombre: espacios.nombre,
      invita: perfiles.nombre,
    })
    .from(invitaciones)
    .innerJoin(espacios, eq(espacios.id, invitaciones.espacioId))
    .innerJoin(perfiles, eq(perfiles.id, invitaciones.creadaPor))
    .where(
      and(
        eq(invitaciones.tokenHash, hashDe(token)),
        isNull(invitaciones.usadaEn),
        gt(invitaciones.venceEn, new Date()),
      ),
    );
  if (!fila) return null;

  const [lugar] = await dbAdmin
    .select({ cuantos: count() })
    .from(perfiles)
    .where(eq(perfiles.espacioId, fila.espacioId));
  return (lugar?.cuantos ?? 0) < MAXIMO_POR_ESPACIO ? fila : null;
}

/**
 * Marca la invitación como usada, pero solo si nadie la usó antes: el `where`
 * sobre `usada_en` hace que dos canjes simultáneos no pasen los dos.
 */
export async function reservarInvitacion(id: string) {
  const filas = await dbAdmin
    .update(invitaciones)
    .set({ usadaEn: new Date() })
    .where(and(eq(invitaciones.id, id), isNull(invitaciones.usadaEn)))
    .returning({ id: invitaciones.id });
  return filas.length === 1;
}

/** Si el alta falló después de reservarla, que el link vuelva a servir. */
export async function liberarInvitacion(id: string) {
  await dbAdmin.update(invitaciones).set({ usadaEn: null }).where(eq(invitaciones.id, id));
}

/** Suma a la persona invitada, con el color que no tiene la otra. */
export async function sumarAlEspacio(userId: string, espacioId: string, nombre: string) {
  const [otro] = await dbAdmin
    .select({ color: perfiles.color })
    .from(perfiles)
    .where(eq(perfiles.espacioId, espacioId));
  await dbAdmin.insert(perfiles).values({
    id: userId,
    espacioId,
    nombre,
    color: otro?.color === 'menta' ? 'durazno' : 'menta',
  });
}

/* ------------------------------- movie night ----------------------------- */

type Tx = Parameters<Parameters<typeof comoUsuario>[1]>[0];

/** An abandoned session does not block the next one: after 6 hours it is considered closed. */
const LIFETIME_HOURS = 6;
const expiredBefore = () => new Date(Date.now() - LIFETIME_HOURS * 3_600_000);

/** The row without the secret: the only thing that goes out to the browser. */
export function toPublic(night: Night): PublicNight {
  const { secret: _secret, ...rest } = night;
  return rest;
}

/**
 * Marks a pending entry as "tonight's pick" (or none, with null). First lets go
 * of whatever was picked: the unique index does not allow two per space.
 */
async function setPickedIn(tx: Tx, spaceId: string, entryId: string | null) {
  await tx
    .update(entradas)
    .set({ pickedAt: null })
    .where(and(eq(entradas.espacioId, spaceId), isNotNull(entradas.pickedAt)));
  if (entryId) {
    const rows = await tx
      .update(entradas)
      .set({ pickedAt: new Date() })
      .where(and(eq(entradas.id, entryId), eq(entradas.estado, 'pendiente')))
      .returning({ id: entradas.id });
    if (rows.length === 0) throw new Error('Esa película ya no está en pendientes');
  }
}

export async function setPicked(userId: string, spaceId: string, entryId: string | null) {
  return comoUsuario(userId, (tx) => setPickedIn(tx, spaceId, entryId));
}

/**
 * Solo mode has no session: the draw is local and only the result is kept
 * here, as an already finished night, so Resumen can count it.
 */
export async function recordSoloPick(userId: string, spaceId: string, entryId: string) {
  return comoUsuario(userId, async (tx) => {
    await setPickedIn(tx, spaceId, entryId);
    await tx.insert(nights).values({
      spaceId,
      mode: 'individual',
      phase: 'terminada',
      game: null,
      createdBy: userId,
      entryId,
      finishedAt: new Date(),
    });
  });
}

/** The space's live session, if there is one and it has not expired. */
export async function activeNight(userId: string): Promise<PublicNight | null> {
  return comoUsuario(userId, async (tx) => {
    const [row] = await tx
      .select()
      .from(nights)
      .where(and(inArray(nights.phase, LIVE_PHASES), gt(nights.createdAt, expiredBefore())));
    return row ? toPublic(row) : null;
  });
}

/** Whether a row is a just-for-fun session. */
const isCasual = sql`coalesce((${nights.state}->>'casual')::boolean, false)`;

/**
 * What the night screen has to show: the live session, or the one that just
 * ended while its pick is still waiting at the top of Pendientes (so a reload
 * does not wipe the celebration), or one cancelled a moment ago (so the other
 * phone, if it reloads, still sees who closed it).
 *
 * With `casual`, the same for the just-for-fun sessions: there is no pick to
 * wait on, so a finished one stays a few minutes for the rematch.
 */
export async function recentNight(userId: string, casual = false): Promise<PublicNight | null> {
  const live = await activeNight(userId);
  if (live) return live;

  return comoUsuario(userId, async (tx) => {
    const [last] = await tx
      .select({ night: nights, pickedAt: entradas.pickedAt })
      .from(nights)
      .leftJoin(entradas, eq(entradas.id, nights.entryId))
      .where(
        and(
          eq(nights.mode, 'duo'),
          inArray(nights.phase, ['terminada', 'cancelada']),
          casual ? isCasual : not(isCasual),
        ),
      )
      .orderBy(desc(nights.updatedAt))
      .limit(1);
    if (!last) return null;

    const age = Date.now() - last.night.updatedAt.getTime();
    if (last.night.phase === 'cancelada') return age < 2 * 60_000 ? toPublic(last.night) : null;
    if (casual) return age < 10 * 60_000 ? toPublic(last.night) : null;
    // Finished: while its pick is still waiting. Letting it go is "pick another".
    return last.pickedAt !== null ? toPublic(last.night) : null;
  });
}

/** The full row, secret included: only for the server to compute a player's private view. */
export async function nightWithSecret(userId: string, id: string): Promise<Night | null> {
  return comoUsuario(userId, async (tx) => {
    const [row] = await tx.select().from(nights).where(eq(nights.id, id));
    return row ?? null;
  });
}

export async function findNight(userId: string, id: string): Promise<PublicNight | null> {
  return comoUsuario(userId, async (tx) => {
    const [row] = await tx.select().from(nights).where(eq(nights.id, id));
    return row ? toPublic(row) : null;
  });
}

/**
 * Opens a session, or returns the one already open. If both tap "De a dos" at
 * the same time, the partial index makes the second one collide and both end
 * up on the same row.
 */
export async function createNight(userId: string, spaceId: string, casual = false): Promise<PublicNight> {
  return comoUsuario(userId, async (tx) => {
    await tx
      .update(nights)
      .set({ phase: 'cancelada', updatedAt: new Date() })
      .where(and(inArray(nights.phase, LIVE_PHASES), lt(nights.createdAt, expiredBefore())));

    const [created] = await tx
      .insert(nights)
      .values({
        spaceId,
        mode: 'duo',
        phase: 'esperando',
        createdBy: userId,
        state: casual ? { present: [userId], casual } : { present: [userId], candidates: {} },
      })
      .onConflictDoNothing()
      .returning();
    if (created) return toPublic(created);

    const [active] = await tx.select().from(nights).where(inArray(nights.phase, LIVE_PHASES));
    if (!active) throw new Error('No se pudo abrir la sesión');
    return toPublic(active);
  });
}

export type Transition = {
  changes: Partial<Pick<Night, 'phase' | 'game' | 'state' | 'secret' | 'winnerId' | 'entryId'>>;
  /** If the night ends, with which entry. Marks "tonight's pick" in the same transaction. */
  picked?: string;
};

/**
 * Every transition of a session goes through here: it reads the locked row
 * (`for update`), applies the rule and writes bumping `version`. Two moves
 * that arrive at once are serialized, and the second one sees the state the
 * first one left instead of overwriting it.
 */
export async function transitionNight(
  userId: string,
  id: string,
  rule: (night: Night) => Transition | Promise<Transition>,
): Promise<PublicNight> {
  return comoUsuario(userId, async (tx) => {
    const [current] = await tx.select().from(nights).where(eq(nights.id, id)).for('update');
    if (!current) throw new Error('Esa sesión ya no existe');

    const { changes, picked } = await rule(current);
    const ends = changes.phase === 'terminada';

    const [updated] = await tx
      .update(nights)
      .set({
        ...changes,
        version: current.version + 1,
        updatedAt: new Date(),
        ...(ends ? { finishedAt: new Date() } : {}),
      })
      .where(eq(nights.id, id))
      .returning();

    if (ends && picked) await setPickedIn(tx, current.spaceId, picked);
    return toPublic(updated!);
  });
}

/** The watched movies, with what the games need: cards and titles. */
export type GameAssets = { cards: Card[]; titles: HangmanTitle[]; library: LibraryEntry[] };

/**
 * The watched movies, with everything the games need: cards for memory,
 * titles for hangman, and the full entry (director, runtime, genres, the
 * stars each one gave it) for the trivia. The ratings come in a second query
 * instead of a join: two people, a few hundred rows, and it reads better.
 */
export async function gameAssets(userId: string): Promise<GameAssets> {
  return comoUsuario(userId, async (tx) => {
    const [rows, stars] = await Promise.all([
      tx
        .select({
          entryId: vEntradasPuntuadas.id,
          title: vEntradasPuntuadas.titulo,
          year: vEntradasPuntuadas.anio,
          director: peliculas.director,
          durationMin: vEntradasPuntuadas.duracionMin,
          posterPath: vEntradasPuntuadas.posterPath,
          genres: vEntradasPuntuadas.generos,
        })
        .from(vEntradasPuntuadas)
        .leftJoin(
          peliculas,
          and(eq(peliculas.tmdbId, vEntradasPuntuadas.tmdbId), eq(peliculas.tipo, vEntradasPuntuadas.tipo)),
        )
        .where(eq(vEntradasPuntuadas.estado, 'vista')),
      tx
        .select({ entryId: puntajes.entradaId, personId: puntajes.perfilId, stars: puntajes.estrellas })
        .from(puntajes),
    ]);

    const library: LibraryEntry[] = rows.map((r) => ({
      ...r,
      director: r.director ?? null,
      ratings: Object.fromEntries(
        stars.filter((s) => s.entryId === r.entryId).map((s) => [s.personId, s.stars]),
      ),
    }));
    return {
      library,
      cards: rows.map((r) => ({ entryId: r.entryId, title: r.title, year: r.year, posterPath: r.posterPath })),
      titles: rows.map((r) => ({ title: r.title, year: r.year, genre: r.genres[0] ?? null })),
    };
  });
}

export type NightsTally = {
  total: number;
  agreed: number;
  byDice: number;
  byPerson: Record<string, number>;
  byGame: Partial<Record<Game, number>>;
};

/** How many nights there were and who won how many, for Resumen. */
export async function nightsTally(userId: string): Promise<NightsTally> {
  return comoUsuario(userId, async (tx) => {
    const rows = await tx
      .select({
        mode: nights.mode,
        game: nights.game,
        winnerId: nights.winnerId,
        count: sql<number>`count(*)::int`,
      })
      .from(nights)
      .where(and(eq(nights.phase, 'terminada'), not(isCasual)))
      .groupBy(nights.mode, nights.game, nights.winnerId);

    const tally: NightsTally = { total: 0, agreed: 0, byDice: 0, byPerson: {}, byGame: {} };
    for (const r of rows) {
      tally.total += r.count;
      if (r.mode === 'individual') tally.byDice += r.count;
      else if (!r.winnerId) tally.agreed += r.count;
      else tally.byPerson[r.winnerId] = (tally.byPerson[r.winnerId] ?? 0) + r.count;
      if (r.game) tally.byGame[r.game] = (tally.byGame[r.game] ?? 0) + r.count;
    }
    return tally;
  });
}

/** The latest nights, with the title and who won. */
export async function nightsHistory(userId: string, limit = 6) {
  return comoUsuario(userId, (tx) =>
    tx
      .select({
        id: nights.id,
        mode: nights.mode,
        game: nights.game,
        winnerId: nights.winnerId,
        winnerName: perfiles.nombre,
        entryId: nights.entryId,
        title: vEntradasPuntuadas.titulo,
        posterPath: vEntradasPuntuadas.posterPath,
        year: vEntradasPuntuadas.anio,
        finishedAt: nights.finishedAt,
      })
      .from(nights)
      .leftJoin(perfiles, eq(perfiles.id, nights.winnerId))
      .leftJoin(vEntradasPuntuadas, eq(vEntradasPuntuadas.id, nights.entryId))
      .where(and(eq(nights.phase, 'terminada'), not(isCasual)))
      .orderBy(desc(nights.finishedAt))
      .limit(limit),
  );
}

export type HistoryNight = Awaited<ReturnType<typeof nightsHistory>>[number];

function hoy() {
  return hoyISO(ZONA_LIBRETA);
}
