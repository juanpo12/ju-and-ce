/**
 * Los casos de prueba de las politicas RLS, con tres usuarios: Juan y Ceci
 * comparten un espacio, Intruso tiene el suyo. Cada assertion corre en su propia
 * transaccion con el rol `authenticated` y los claims del usuario, o sea contra
 * las mismas politicas que va a atravesar la app.
 *
 * El archivo no elige base: recibe un `Ctx` y los dos entrypoints le pasan el
 * suyo — `local.ts` (Postgres en proceso, sin credenciales) y `supabase.ts`
 * (el proyecto de verdad). Los mismos casos, las dos bases.
 *
 * Es idempotente: limpia sus fixtures al empezar y al terminar.
 */
import { sql, eq, and, type SQL } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from '../schema';
import { entradas, espacios, nights, peliculas, perfiles, puntajes } from '../schema';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export type Ctx = {
  /** Conexion privilegiada: la RLS no se le aplica. */
  dbAdmin: Db;
  /** Corre `fn` con el rol `authenticated` y los claims de `userId`. */
  comoUsuario: <T>(userId: string, fn: (tx: Db) => Promise<T>) => Promise<T>;
  /** Normaliza el resultado crudo: cada driver lo devuelve con otra forma. */
  filas: <T = Record<string, unknown>>(db: Db, consulta: SQL) => Promise<T[]>;
};

const JUAN = '00000000-0000-4000-8000-000000000001';
const CECI = '00000000-0000-4000-8000-000000000002';
const INTRUSO = '00000000-0000-4000-8000-000000000003';
const ESPACIO_A = '00000000-0000-4000-8000-0000000000aa';
const ESPACIO_B = '00000000-0000-4000-8000-0000000000bb';

export async function correrCasos({ dbAdmin, comoUsuario, filas }: Ctx) {
  let ok = 0;
  let fallos = 0;

  function chequear(nombre: string, condicion: boolean, detalle = '') {
    if (condicion) {
      ok++;
      console.log(`  ✓ ${nombre}`);
    } else {
      fallos++;
      console.log(`  ✗ ${nombre}${detalle ? `  → ${detalle}` : ''}`);
    }
  }

  /** Espera que la operacion sea rechazada por la base. */
  async function debeFallar(nombre: string, fn: () => Promise<unknown>) {
    try {
      await fn();
      chequear(nombre, false, 'la operacion fue permitida');
    } catch (e) {
      chequear(nombre, true, String((e as Error).message).slice(0, 60));
    }
  }

  async function limpiar() {
    await dbAdmin.execute(sql`
      delete from noches where espacio_id in (${ESPACIO_A}::uuid, ${ESPACIO_B}::uuid)`);
    await dbAdmin.execute(sql`
      delete from puntajes where perfil_id in (${JUAN}::uuid, ${CECI}::uuid, ${INTRUSO}::uuid)`);
    await dbAdmin.execute(sql`
      delete from entradas where espacio_id in (${ESPACIO_A}::uuid, ${ESPACIO_B}::uuid)`);
    await dbAdmin.execute(sql`
      delete from perfiles where id in (${JUAN}::uuid, ${CECI}::uuid, ${INTRUSO}::uuid)`);
    await dbAdmin.execute(sql`
      delete from espacios where id in (${ESPACIO_A}::uuid, ${ESPACIO_B}::uuid)`);
    await dbAdmin.execute(sql`
      delete from auth.users where id in (${JUAN}::uuid, ${CECI}::uuid, ${INTRUSO}::uuid)`);
  }

  async function sembrar() {
    // Usuarios de prueba. En la app los crea el magic link; aca hace falta la fila
    // en auth.users porque perfiles.id la referencia.
    await dbAdmin.execute(sql`
      insert into auth.users (id, email, aud, role) values
        (${JUAN}::uuid,    'juan@prueba.local',    'authenticated', 'authenticated'),
        (${CECI}::uuid,    'ceci@prueba.local',    'authenticated', 'authenticated'),
        (${INTRUSO}::uuid, 'intruso@prueba.local', 'authenticated', 'authenticated')`);

    await dbAdmin.insert(espacios).values([
      { id: ESPACIO_A, nombre: 'Juan y Ceci' },
      { id: ESPACIO_B, nombre: 'Casa ajena' },
    ]);

    await dbAdmin.insert(perfiles).values([
      { id: JUAN, espacioId: ESPACIO_A, nombre: 'Juan', color: 'durazno' },
      { id: CECI, espacioId: ESPACIO_A, nombre: 'Ceci', color: 'menta' },
      { id: INTRUSO, espacioId: ESPACIO_B, nombre: 'Intruso' },
    ]);

    const [a1, a2, a3, b1] = await dbAdmin
      .insert(entradas)
      .values([
        { espacioId: ESPACIO_A, tmdbId: 157336, estado: 'vista', vistaEl: '2026-01-10', lugar: 'sillón', agregadaPor: JUAN },
        { espacioId: ESPACIO_A, tmdbId: 496243, estado: 'vista', vistaEl: '2026-02-14', lugar: 'cine', agregadaPor: CECI },
        { espacioId: ESPACIO_A, tmdbId: 129, estado: 'pendiente', agregadaPor: CECI },
        { espacioId: ESPACIO_B, tmdbId: 157336, estado: 'vista', vistaEl: '2026-03-01', agregadaPor: INTRUSO },
      ])
      .returning({ id: entradas.id });

    // Interestelar la puntuaron los dos; Parasitos solo Juan todavia.
    await dbAdmin.insert(puntajes).values([
      { entradaId: a1!.id, perfilId: JUAN, estrellas: 5, comentario: 'La mejor.' },
      { entradaId: a1!.id, perfilId: CECI, estrellas: 4, comentario: 'Larga pero linda.' },
      { entradaId: a2!.id, perfilId: JUAN, estrellas: 4.5 },
      { entradaId: b1!.id, perfilId: INTRUSO, estrellas: 3 },
    ]);

    return { a1: a1!.id, a2: a2!.id, a3: a3!.id, b1: b1!.id };
  }

  async function contar(userId: string, tabla: string) {
    return comoUsuario(userId, async (tx) => {
      const [r] = await filas<{ n: number }>(
        tx, sql`select count(*)::int as n from ${sql.identifier(tabla)}`);
      return Number(r!.n);
    });
  }

  console.log('\nLimpiando y sembrando fixtures…');
  await limpiar();
  const ids = await sembrar();

  console.log('\nPeliculas (ficha global de TMDB)');
  {
    const n = await contar(JUAN, 'peliculas');
    chequear('un autenticado lee las fichas de TMDB', n >= 3, `vio ${n}`);
    await debeFallar('un autenticado NO puede escribir una ficha', () =>
      comoUsuario(JUAN, (tx) =>
        tx.insert(peliculas).values({ tmdbId: 999999, titulo: 'Falsa' })),
    );
  }

  console.log('\nEspacios y perfiles');
  {
    chequear('Juan ve solo su espacio', (await contar(JUAN, 'espacios')) === 1);
    chequear('Intruso ve solo el suyo', (await contar(INTRUSO, 'espacios')) === 1);
    const nombreDesdeIntruso = await comoUsuario(INTRUSO, (tx) =>
      tx.select().from(espacios).where(eq(espacios.id, ESPACIO_A)));
    chequear('Intruso no ve el espacio de Juan y Ceci', nombreDesdeIntruso.length === 0);

    chequear('Juan ve los dos perfiles de su espacio', (await contar(JUAN, 'perfiles')) === 2);
    chequear('Intruso ve solo su perfil', (await contar(INTRUSO, 'perfiles')) === 1);

    const propio = await comoUsuario(JUAN, (tx) =>
      tx.update(perfiles).set({ tema: 'bullet' }).where(eq(perfiles.id, JUAN)).returning());
    chequear('Juan cambia su propio tema', propio.length === 1);

    const ajeno = await comoUsuario(JUAN, (tx) =>
      tx.update(perfiles).set({ tema: 'bullet' }).where(eq(perfiles.id, CECI)).returning());
    chequear('Juan NO puede cambiar el tema de Ceci', ajeno.length === 0);

    for (const tema of ['papel', 'bullet', 'menta']) {
      const r = await comoUsuario(JUAN, (tx) =>
        tx.update(perfiles).set({ tema }).where(eq(perfiles.id, JUAN)).returning());
      chequear(`el tema «${tema}» es valido`, r.length === 1);
    }
    await debeFallar('el check rechaza un tema que no existe', () =>
      dbAdmin.execute(sql`update perfiles set tema = 'neon' where id = ${JUAN}::uuid`));

    await debeFallar('Juan NO puede mudarse a otro espacio', () =>
      comoUsuario(JUAN, (tx) =>
        tx.update(perfiles).set({ espacioId: ESPACIO_B }).where(eq(perfiles.id, JUAN))),
    );
  }

  console.log('\nEntradas (la libreta)');
  {
    chequear('Juan ve las 3 entradas de su espacio', (await contar(JUAN, 'entradas')) === 3);
    chequear('Ceci ve las mismas 3', (await contar(CECI, 'entradas')) === 3);
    chequear('Intruso ve solo la suya', (await contar(INTRUSO, 'entradas')) === 1);

    await debeFallar('Intruso NO puede agregar a la libreta ajena', () =>
      comoUsuario(INTRUSO, (tx) =>
        tx.insert(entradas).values({
          espacioId: ESPACIO_A, tmdbId: 129, estado: 'pendiente', agregadaPor: INTRUSO,
        })),
    );

    const editada = await comoUsuario(INTRUSO, (tx) =>
      tx.update(entradas).set({ lugar: 'mi casa' }).where(eq(entradas.id, ids.a1)).returning());
    chequear('Intruso NO puede editar una entrada ajena', editada.length === 0);

    const borrado = await comoUsuario(INTRUSO, (tx) =>
      tx.delete(entradas).where(eq(entradas.id, ids.a1)).returning());
    chequear('Intruso NO puede borrar una entrada ajena', borrado.length === 0);

    // Pendiente → vista es un update de estado, no una fila nueva.
    const pasada = await comoUsuario(JUAN, (tx) =>
      tx.update(entradas).set({ estado: 'vista', vistaEl: '2026-09-20' })
        .where(eq(entradas.id, ids.a3)).returning({ agregadaPor: entradas.agregadaPor }));
    chequear('pendiente → vista conserva quien la sumo', pasada[0]?.agregadaPor === CECI);
    await dbAdmin.update(entradas).set({ estado: 'pendiente', vistaEl: null })
      .where(eq(entradas.id, ids.a3));

    await debeFallar('el check rechaza un estado invalido', () =>
      dbAdmin.execute(sql`update entradas set estado = 'quizas' where id = ${ids.a3}::uuid`));
  }

  console.log('\nPuntajes (la regla del producto)');
  {
    const vistos = await comoUsuario(JUAN, (tx) =>
      tx.select().from(puntajes).where(eq(puntajes.entradaId, ids.a1)));
    chequear('Juan ve los dos puntajes de Interestelar', vistos.length === 2);
    chequear('y lee el comentario de Ceci',
      vistos.some((p) => p.perfilId === CECI && p.comentario === 'Larga pero linda.'));

    const mio = await comoUsuario(JUAN, (tx) =>
      tx.update(puntajes).set({ estrellas: 4.5 })
        .where(and(eq(puntajes.entradaId, ids.a1), eq(puntajes.perfilId, JUAN))).returning());
    chequear('Juan edita su propio puntaje', mio.length === 1 && mio[0]!.estrellas === 4.5);

    const tuyo = await comoUsuario(JUAN, (tx) =>
      tx.update(puntajes).set({ estrellas: 1 })
        .where(and(eq(puntajes.entradaId, ids.a1), eq(puntajes.perfilId, CECI))).returning());
    chequear('Juan NO puede editar el puntaje de Ceci', tuyo.length === 0);

    await debeFallar('Juan NO puede puntuar a nombre de Ceci', () =>
      comoUsuario(JUAN, (tx) =>
        tx.insert(puntajes).values({ entradaId: ids.a3, perfilId: CECI, estrellas: 5 })),
    );

    await debeFallar('Juan NO puede puntuar una entrada de otro espacio', () =>
      comoUsuario(JUAN, (tx) =>
        tx.insert(puntajes).values({ entradaId: ids.b1, perfilId: JUAN, estrellas: 5 })),
    );

    const ajenos = await comoUsuario(INTRUSO, (tx) =>
      tx.select().from(puntajes).where(eq(puntajes.entradaId, ids.a1)));
    chequear('Intruso no ve ningun puntaje del espacio A', ajenos.length === 0);

    await debeFallar('el check rechaza 6 estrellas', () =>
      dbAdmin.insert(puntajes).values({ entradaId: ids.a3, perfilId: JUAN, estrellas: 6 }));
    await debeFallar('el check rechaza 0 estrellas', () =>
      dbAdmin.insert(puntajes).values({ entradaId: ids.a3, perfilId: JUAN, estrellas: 0 }));
  }

  console.log('\nVistas y resumen() (security_invoker)');
  {
    const vista = await comoUsuario(JUAN, (tx) =>
      filas<{ titulo: string; promedio: string | null; cuantos_puntuaron: string }>(
        tx, sql`select id, titulo, promedio, cuantos_puntuaron
                from v_entradas_puntuadas order by titulo`));
    chequear('la vista respeta la RLS: Juan ve 3 filas', vista.length === 3, `vio ${vista.length}`);

    const inter = vista.find((f) => f.titulo === 'Interestelar');
    // Juan se bajo a 4,5 y Ceci quedo en 4 → promedio 4,25.
    chequear('el promedio sale derivado de los dos puntajes',
      Number(inter?.promedio) === 4.25, `promedio ${inter?.promedio}`);
    chequear('cuantos_puntuaron marca que coincidieron', Number(inter?.cuantos_puntuaron) === 2);

    const pendiente = vista.find((f) => f.titulo === 'El viaje de Chihiro');
    chequear('una pendiente vive en la libreta sin puntajes',
      pendiente !== undefined && pendiente.promedio === null);

    const deIntruso = await comoUsuario(INTRUSO, (tx) =>
      filas(tx, sql`select id from v_entradas_puntuadas`));
    chequear('la vista no filtra datos a otro espacio', deIntruso.length === 1);

    const [r] = await comoUsuario(JUAN, (tx) =>
      filas<{ r: Record<string, number> }>(tx, sql`select resumen() as r`));
    const resumen = r!.r;
    console.log(`    resumen() de Juan → ${JSON.stringify(resumen)}`);
    chequear('resumen() cuenta 2 vistas', resumen.vistas === 2);
    chequear('resumen() cuenta 1 coincidencia', resumen.coincidimos === 1);
    chequear('resumen() suma las horas (169 + 132 min ≈ 5 h)', resumen.horas === 5);

    const generos = await comoUsuario(JUAN, (tx) =>
      filas<{ genero: string; cantidad: string }>(
        tx, sql`select genero, cantidad from v_por_genero order by cantidad desc, genero`));
    console.log(`    generos → ${generos.map((x) => `${x.genero}:${x.cantidad}`).join(', ')}`);
    chequear('Drama aparece en las 2 vistas',
      Number(generos.find((x) => x.genero === 'Drama')?.cantidad) === 2);
    chequear('la pendiente no cuenta para los generos',
      !generos.some((x) => x.genero === 'Animación'));
  }

  console.log('\nNoches de peli (la sesión y el historial)');
  {
    const [created] = await comoUsuario(JUAN, (tx) =>
      tx.insert(nights).values({ spaceId: ESPACIO_A, mode: 'duo', phase: 'esperando', createdBy: JUAN })
        .returning({ id: nights.id }));
    chequear('Juan abre una noche en su espacio', created !== undefined);
    const nightId = created!.id;

    await debeFallar('Intruso NO puede abrir una noche en el espacio ajeno', () =>
      comoUsuario(INTRUSO, (tx) =>
        tx.insert(nights).values({ spaceId: ESPACIO_A, mode: 'duo', phase: 'esperando', createdBy: INTRUSO })),
    );

    chequear('Ceci ve la noche que abrió Juan', (await contar(CECI, 'noches')) === 1);
    chequear('Intruso no ve ninguna', (await contar(INTRUSO, 'noches')) === 0);

    const joined = await comoUsuario(CECI, (tx) =>
      tx.update(nights).set({ phase: 'candidatas', version: 1 }).where(eq(nights.id, nightId)).returning());
    chequear('Ceci la actualiza: es del espacio, no de quien la abrió', joined.length === 1);

    const foreign = await comoUsuario(INTRUSO, (tx) =>
      tx.update(nights).set({ phase: 'cancelada' }).where(eq(nights.id, nightId)).returning());
    chequear('Intruso NO puede tocarla', foreign.length === 0);

    await debeFallar('una segunda noche viva en el mismo espacio es rechazada', () =>
      comoUsuario(CECI, (tx) =>
        tx.insert(nights).values({ spaceId: ESPACIO_A, mode: 'duo', phase: 'esperando', createdBy: CECI })),
    );

    await comoUsuario(JUAN, (tx) =>
      tx.update(nights).set({ phase: 'terminada', game: 'ppt', winnerId: CECI, entryId: ids.a3, finishedAt: new Date() })
        .where(eq(nights.id, nightId)));
    const [another] = await comoUsuario(CECI, (tx) =>
      tx.insert(nights).values({ spaceId: ESPACIO_A, mode: 'duo', phase: 'esperando', createdBy: CECI })
        .returning({ id: nights.id }));
    chequear('terminada la primera, se puede abrir otra', another !== undefined);

    await debeFallar('el check rechaza una fase que no existe', () =>
      dbAdmin.execute(sql`update noches set fase = 'dudando' where id = ${another!.id}::uuid`));
    await debeFallar('el check rechaza un juego que no existe', () =>
      dbAdmin.execute(sql`update noches set juego = 'truco' where id = ${another!.id}::uuid`));

    const deleted = await comoUsuario(INTRUSO, (tx) =>
      tx.delete(nights).where(eq(nights.id, nightId)).returning());
    chequear('Intruso NO puede borrar el historial ajeno', deleted.length === 0);
  }

  console.log('\nLa de esta noche (entradas.elegida_en)');
  {
    const picked = await comoUsuario(JUAN, (tx) =>
      tx.update(entradas).set({ pickedAt: new Date() }).where(eq(entradas.id, ids.a3)).returning());
    chequear('Juan marca la pendiente como elegida', picked.length === 1);

    await debeFallar('dos elegidas en el mismo espacio es rechazado', () =>
      dbAdmin.execute(sql`update entradas set elegida_en = now() where id = ${ids.a1}::uuid`));

    const foreign = await comoUsuario(INTRUSO, (tx) =>
      tx.update(entradas).set({ pickedAt: null }).where(eq(entradas.id, ids.a3)).returning());
    chequear('Intruso NO puede soltar la elegida ajena', foreign.length === 0);

    // The view is created with `e.*`, which expands at creation time: this
    // fails if migration 0008 did not recreate it.
    const view = await comoUsuario(JUAN, (tx) =>
      filas<{ elegida_en: string | null }>(
        tx, sql`select elegida_en from v_entradas_puntuadas where id = ${ids.a3}::uuid`));
    chequear('la vista expone elegida_en (se recreó en 0008)', view[0]?.elegida_en != null);

    await dbAdmin.update(entradas).set({ pickedAt: null }).where(eq(entradas.id, ids.a3));
  }

  console.log('\nLimpiando fixtures…');
  await limpiar();

  console.log(`\n${fallos === 0 ? '✓ TODO BIEN' : '✗ HAY FALLOS'} — ${ok} pasaron, ${fallos} fallaron\n`);
    return { ok, fallos };
}
