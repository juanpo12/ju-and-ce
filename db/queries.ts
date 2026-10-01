import 'server-only';
import { cache } from 'react';
import { and, asc, count, desc, eq, getViewSelectedFields, gt, gte, inArray, isNotNull, isNull, lt, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  comoUsuario,
  dbAdmin,
  entradas,
  espacios,
  invitaciones,
  noches,
  peliculas,
  perfiles,
  puntajes,
  vEntradasPuntuadas,
  vPorGenero,
  type EntradaPuntuada,
  type Noche,
  type Perfil,
  type Tipo,
} from './index';
import { createHash, randomBytes } from 'node:crypto';
import { hoyISO, ZONA_LIBRETA } from '@/lib/fechas';
import { FASES_VIVAS, type Carta, type Juego, type NochePublica } from '@/lib/noche';
import type { TituloParaAhorcar } from '@/lib/juegos/ahorcado';

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
        elegidaEn: vEntradasPuntuadas.elegidaEn,
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
      // Si era «la de esta noche», ya no espera a nadie.
      .set({ estado: 'vista', vistaEl: datos.vistaEl ?? hoy(), lugar: datos.lugar || null, elegidaEn: null })
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

/* ------------------------------ noche de peli ---------------------------- */

type Tx = Parameters<Parameters<typeof comoUsuario>[1]>[0];

/** Una sesión abandonada no bloquea la siguiente: a las 6 horas se da por cerrada. */
const HORAS_DE_VIDA = 6;
const vencida = () => new Date(Date.now() - HORAS_DE_VIDA * 3_600_000);

/** La fila sin el secreto: lo único que sale al navegador. */
export function publica(noche: Noche): NochePublica {
  const { secreto: _secreto, ...resto } = noche;
  return resto;
}

/**
 * Marca una pendiente como «la de esta noche» (o ninguna, con null). Primero
 * suelta la que hubiera: el índice único no deja dos por espacio.
 */
async function marcarElegidaEn(tx: Tx, espacioId: string, entradaId: string | null) {
  await tx
    .update(entradas)
    .set({ elegidaEn: null })
    .where(and(eq(entradas.espacioId, espacioId), isNotNull(entradas.elegidaEn)));
  if (entradaId) {
    const filas = await tx
      .update(entradas)
      .set({ elegidaEn: new Date() })
      .where(and(eq(entradas.id, entradaId), eq(entradas.estado, 'pendiente')))
      .returning({ id: entradas.id });
    if (filas.length === 0) throw new Error('Esa película ya no está en pendientes');
  }
}

export async function marcarElegida(userId: string, espacioId: string, entradaId: string | null) {
  return comoUsuario(userId, (tx) => marcarElegidaEn(tx, espacioId, entradaId));
}

/**
 * El modo individual no tiene sesión: el sorteo es local y acá queda solo el
 * resultado, como una noche ya terminada, para que Resumen la cuente.
 */
export async function registrarEleccionIndividual(userId: string, espacioId: string, entradaId: string) {
  return comoUsuario(userId, async (tx) => {
    await marcarElegidaEn(tx, espacioId, entradaId);
    await tx.insert(noches).values({
      espacioId,
      modo: 'individual',
      fase: 'terminada',
      juego: null,
      creadaPor: userId,
      entradaId,
      terminadaEn: new Date(),
    });
  });
}

/** La sesión viva del espacio, si hay una y no está vencida. */
export async function nocheActiva(userId: string): Promise<NochePublica | null> {
  return comoUsuario(userId, async (tx) => {
    const [fila] = await tx
      .select()
      .from(noches)
      .where(and(inArray(noches.fase, FASES_VIVAS), gt(noches.creadaEn, vencida())));
    return fila ? publica(fila) : null;
  });
}

/**
 * Lo que la pantalla de la noche tiene que mostrar: la sesión viva, o la que
 * recién terminó mientras su elegida siga esperando arriba de Pendientes (así
 * un reload no borra el festejo), o una cancelada hace un momento (para que
 * el otro celular, si recarga, igual vea quién cerró).
 */
export async function nocheReciente(userId: string): Promise<NochePublica | null> {
  const viva = await nocheActiva(userId);
  if (viva) return viva;

  return comoUsuario(userId, async (tx) => {
    const [ultima] = await tx
      .select({ noche: noches, elegidaEn: entradas.elegidaEn })
      .from(noches)
      .leftJoin(entradas, eq(entradas.id, noches.entradaId))
      .where(and(eq(noches.modo, 'duo'), inArray(noches.fase, ['terminada', 'cancelada'])))
      .orderBy(desc(noches.actualizadaEn))
      .limit(1);
    if (!ultima) return null;

    const haceUnRato = Date.now() - ultima.noche.actualizadaEn.getTime() < 2 * 60_000;
    if (ultima.noche.fase === 'cancelada') return haceUnRato ? publica(ultima.noche) : null;
    // Terminada: mientras su elegida siga esperando. Soltarla es «elegir otra».
    return ultima.elegidaEn !== null ? publica(ultima.noche) : null;
  });
}

export async function buscarNoche(userId: string, id: string): Promise<NochePublica | null> {
  return comoUsuario(userId, async (tx) => {
    const [fila] = await tx.select().from(noches).where(eq(noches.id, id));
    return fila ? publica(fila) : null;
  });
}

/**
 * Abre una sesión, o devuelve la que ya estaba abierta. Si los dos tocan «De a
 * dos» al mismo tiempo, el índice parcial hace chocar al segundo y los dos
 * terminan en la misma fila.
 */
export async function crearNoche(userId: string, espacioId: string): Promise<NochePublica> {
  return comoUsuario(userId, async (tx) => {
    await tx
      .update(noches)
      .set({ fase: 'cancelada', actualizadaEn: new Date() })
      .where(and(inArray(noches.fase, FASES_VIVAS), lt(noches.creadaEn, vencida())));

    const [nueva] = await tx
      .insert(noches)
      .values({
        espacioId,
        modo: 'duo',
        fase: 'esperando',
        creadaPor: userId,
        estado: { presentes: [userId], candidatas: {} },
      })
      .onConflictDoNothing()
      .returning();
    if (nueva) return publica(nueva);

    const [activa] = await tx.select().from(noches).where(inArray(noches.fase, FASES_VIVAS));
    if (!activa) throw new Error('No se pudo abrir la sesión');
    return publica(activa);
  });
}

export type Transicion = {
  cambios: Partial<Pick<Noche, 'fase' | 'juego' | 'estado' | 'secreto' | 'ganadorId' | 'entradaId'>>;
  /** Si la noche termina, con qué entrada. Marca «la de esta noche» en la misma transacción. */
  elegida?: string;
};

/**
 * Toda transición de una sesión pasa por acá: lee la fila bloqueada
 * (`for update`), aplica la regla y escribe subiendo `version`. Dos jugadas
 * que llegan a la vez se serializan, y la segunda ve el estado que dejó la
 * primera en vez de pisarlo.
 */
export async function transicionarNoche(
  userId: string,
  id: string,
  regla: (noche: Noche) => Transicion | Promise<Transicion>,
): Promise<NochePublica> {
  return comoUsuario(userId, async (tx) => {
    const [actual] = await tx.select().from(noches).where(eq(noches.id, id)).for('update');
    if (!actual) throw new Error('Esa sesión ya no existe');

    const { cambios, elegida } = await regla(actual);
    const termina = cambios.fase === 'terminada';

    const [nueva] = await tx
      .update(noches)
      .set({
        ...cambios,
        version: actual.version + 1,
        actualizadaEn: new Date(),
        ...(termina ? { terminadaEn: new Date() } : {}),
      })
      .where(eq(noches.id, id))
      .returning();

    if (termina && elegida) await marcarElegidaEn(tx, actual.espacioId, elegida);
    return publica(nueva!);
  });
}

/** Las pelis vistas, con lo que los juegos necesitan: cartas y títulos. */
export async function fichasParaJuegos(userId: string): Promise<{ fichas: Carta[]; titulos: TituloParaAhorcar[] }> {
  return comoUsuario(userId, async (tx) => {
    const filas = await tx
      .select({
        entradaId: vEntradasPuntuadas.id,
        titulo: vEntradasPuntuadas.titulo,
        anio: vEntradasPuntuadas.anio,
        posterPath: vEntradasPuntuadas.posterPath,
        generos: vEntradasPuntuadas.generos,
      })
      .from(vEntradasPuntuadas)
      .where(eq(vEntradasPuntuadas.estado, 'vista'));
    return {
      fichas: filas.map(({ generos: _g, ...f }) => f),
      titulos: filas.map((f) => ({ titulo: f.titulo, anio: f.anio, genero: f.generos[0] ?? null })),
    };
  });
}

export type TallyNoches = {
  total: number;
  coincidieron: number;
  alAzar: number;
  porPersona: Record<string, number>;
  porJuego: Partial<Record<Juego, number>>;
};

/** Cuántas noches hubo y quién ganó cuántas, para Resumen. */
export async function tallyNoches(userId: string): Promise<TallyNoches> {
  return comoUsuario(userId, async (tx) => {
    const filas = await tx
      .select({
        modo: noches.modo,
        juego: noches.juego,
        ganadorId: noches.ganadorId,
        cantidad: sql<number>`count(*)::int`,
      })
      .from(noches)
      .where(eq(noches.fase, 'terminada'))
      .groupBy(noches.modo, noches.juego, noches.ganadorId);

    const tally: TallyNoches = { total: 0, coincidieron: 0, alAzar: 0, porPersona: {}, porJuego: {} };
    for (const f of filas) {
      tally.total += f.cantidad;
      if (f.modo === 'individual') tally.alAzar += f.cantidad;
      else if (!f.ganadorId) tally.coincidieron += f.cantidad;
      else tally.porPersona[f.ganadorId] = (tally.porPersona[f.ganadorId] ?? 0) + f.cantidad;
      if (f.juego) tally.porJuego[f.juego] = (tally.porJuego[f.juego] ?? 0) + f.cantidad;
    }
    return tally;
  });
}

/** Las últimas noches, con el título y quién ganó. */
export async function historialDeNoches(userId: string, limite = 6) {
  return comoUsuario(userId, (tx) =>
    tx
      .select({
        id: noches.id,
        modo: noches.modo,
        juego: noches.juego,
        ganadorId: noches.ganadorId,
        ganadorNombre: perfiles.nombre,
        entradaId: noches.entradaId,
        titulo: vEntradasPuntuadas.titulo,
        posterPath: vEntradasPuntuadas.posterPath,
        anio: vEntradasPuntuadas.anio,
        terminadaEn: noches.terminadaEn,
      })
      .from(noches)
      .leftJoin(perfiles, eq(perfiles.id, noches.ganadorId))
      .leftJoin(vEntradasPuntuadas, eq(vEntradasPuntuadas.id, noches.entradaId))
      .where(eq(noches.fase, 'terminada'))
      .orderBy(desc(noches.terminadaEn))
      .limit(limite),
  );
}

export type NocheDelHistorial = Awaited<ReturnType<typeof historialDeNoches>>[number];

function hoy() {
  return hoyISO(ZONA_LIBRETA);
}
