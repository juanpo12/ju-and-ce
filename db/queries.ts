import 'server-only';
import { cache } from 'react';
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import {
  comoUsuario,
  dbAdmin,
  entradas,
  espacios,
  peliculas,
  perfiles,
  puntajes,
  vEntradasPuntuadas,
  vPorGenero,
  type EntradaPuntuada,
  type Perfil,
} from './index';

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

/** El perfil del usuario y el de la otra persona del espacio. */
export async function buscarPerfil(userId: string): Promise<PerfilConCompanero | null> {
  return comoUsuario(userId, async (tx) => {
    const [yo] = await tx.select().from(perfiles).where(eq(perfiles.id, userId));
    if (!yo) return null;

    const [espacio] = await tx
      .select({ nombre: espacios.nombre })
      .from(espacios)
      .where(eq(espacios.id, yo.espacioId));

    const otros = await tx
      .select({ id: perfiles.id, nombre: perfiles.nombre, color: perfiles.color })
      .from(perfiles)
      .where(eq(perfiles.espacioId, yo.espacioId));

    return {
      ...yo,
      espacioNombre: espacio?.nombre ?? 'Nuestra libreta',
      companero: otros.find((p) => p.id !== userId) ?? null,
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
 * Le pega los puntajes individuales a las entradas. Son dos queries en vez de un
 * join con `jsonb_agg`: con dos personas y unos cientos de películas la
 * diferencia no se mide, y esto se lee.
 */
async function conPuntajes(
  tx: Parameters<Parameters<typeof comoUsuario>[1]>[0],
  filas: EntradaPuntuada[],
  userId: string,
): Promise<EntradaConPuntajes[]> {
  if (filas.length === 0) return [];

  const todos = await tx
    .select()
    .from(puntajes)
    .where(inArray(puntajes.entradaId, filas.map((f) => f.id)));

  return filas.map((fila) => {
    const suyos = todos.filter((p) => p.entradaId === fila.id);
    const mio = suyos.find((p) => p.perfilId === userId) ?? null;
    const otro = suyos.find((p) => p.perfilId !== userId) ?? null;
    return {
      ...fila,
      mio: mio && { estrellas: mio.estrellas, comentario: mio.comentario },
      suyo: otro && { estrellas: otro.estrellas, comentario: otro.comentario },
    };
  });
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

    const filas = await tx
      .select()
      .from(vEntradasPuntuadas)
      .where(and(...condiciones))
      .orderBy(...orden);

    return conPuntajes(tx, filas, userId);
  });
}

/** La watchlist compartida: lo que falta ver, con quién la sumó. */
export async function listarPendientes(userId: string) {
  return comoUsuario(userId, async (tx) => {
    return tx
      .select({
        id: vEntradasPuntuadas.id,
        tmdbId: vEntradasPuntuadas.tmdbId,
        titulo: vEntradasPuntuadas.titulo,
        anio: vEntradasPuntuadas.anio,
        duracionMin: vEntradasPuntuadas.duracionMin,
        generos: vEntradasPuntuadas.generos,
        posterPath: vEntradasPuntuadas.posterPath,
        creadaEn: vEntradasPuntuadas.creadaEn,
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
    const [fila] = await tx
      .select()
      .from(vEntradasPuntuadas)
      .where(eq(vEntradasPuntuadas.id, entradaId));
    if (!fila) return null;

    const [ficha] = await tx
      .select({
        tituloOriginal: peliculas.tituloOriginal,
        director: peliculas.director,
        sinopsis: peliculas.sinopsis,
      })
      .from(peliculas)
      .where(eq(peliculas.tmdbId, fila.tmdbId));

    const [conP] = await conPuntajes(tx, [fila], userId);
    const [quien] = await tx
      .select({ nombre: perfiles.nombre })
      .from(perfiles)
      .where(eq(perfiles.id, fila.agregadaPor));

    return { ...conP!, ...ficha, agregadaPorNombre: quien?.nombre ?? null };
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

/** Qué tmdb_id ya están en la libreta: enciende «Ya está en la biblioteca». */
export async function tmdbIdsEnBiblioteca(userId: string): Promise<Set<number>> {
  return comoUsuario(userId, async (tx) => {
    const filas = await tx.select({ tmdbId: entradas.tmdbId }).from(entradas);
    return new Set(filas.map((f) => f.tmdbId));
  });
}

/* -------------------------------- escrituras ----------------------------- */

/** Da de alta una película en la libreta, como vista o como pendiente. */
export async function crearEntrada(
  userId: string,
  espacioId: string,
  datos: {
    tmdbId: number;
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
        estado: datos.estado,
        vistaEl: datos.estado === 'vista' ? (datos.vistaEl ?? hoy()) : null,
        lugar: datos.lugar || null,
        agregadaPor: userId,
      })
      // Si ya estaba, no explota: devolvemos la que había.
      .onConflictDoNothing({ target: [entradas.espacioId, entradas.tmdbId] })
      .returning({ id: entradas.id });

    if (fila) return fila.id;

    const [existente] = await tx
      .select({ id: entradas.id })
      .from(entradas)
      .where(eq(entradas.tmdbId, datos.tmdbId));
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
      .set({ estado: 'vista', vistaEl: datos.vistaEl ?? hoy(), lugar: datos.lugar || null })
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
      target: peliculas.tmdbId,
      set: { ...ficha, actualizadaEn: new Date() },
    });
}

export async function fichaGuardada(tmdbId: number) {
  const [fila] = await dbAdmin.select().from(peliculas).where(eq(peliculas.tmdbId, tmdbId));
  return fila ?? null;
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}
