import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  pgView,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
// Relativo, no `@/`: drizzle-kit carga este archivo con su propio bundler.
// Las listas viven allá porque el navegador también las necesita, y traer el
// esquema entero al bundle del cliente por tres constantes sería un despropósito.
import {
  FASES_NOCHE,
  JUEGOS,
  MODOS_NOCHE,
  type EstadoNoche,
  type Fase,
  type Juego,
  type Modo,
  type SecretoNoche,
} from '../lib/noche';

export { FASES_NOCHE, JUEGOS, MODOS_NOCHE };
import { sql } from 'drizzle-orm';
import { authenticatedRole, authUsers } from 'drizzle-orm/supabase';

// `auth.uid()` envuelto en un select se evalua una sola vez por query en vez de
// una vez por fila. Es la recomendacion de performance de Supabase para RLS.
const yo = sql`(select auth.uid())`;
const miEspacio = sql`public.mi_espacio()`;

/**
 * Una pareja = un espacio. Con dos filas de perfiles alcanza.
 */
export const espacios = pgTable('espacios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  // El espacio propio y nada mas. Se crea del lado del servidor, con la
  // conexion privilegiada: por eso no hay politica de insert.
  pgPolicy('espacios_lectura', {
    for: 'select',
    to: authenticatedRole,
    using: sql`id = ${miEspacio}`,
  }),
]);

/**
 * Una persona. El id es el mismo que el de auth.users: el perfil es la
 * proyeccion de ese usuario dentro de un espacio.
 */
export const perfiles = pgTable('perfiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  espacioId: uuid('espacio_id')
    .notNull()
    .references(() => espacios.id, { onDelete: 'cascade' }),
  nombre: text('nombre').notNull(),
  color: text('color').notNull().default('terracota'),
  tema: text('tema').notNull().default('papel'),
}, (t) => [
  check('perfiles_tema_valido', sql`${t.tema} in ('papel', 'bullet', 'menta', 'hadas', 'pradera', 'acuarela', 'dragon', 'hongo', 'mariposas', 'campanitas')`),
  index('perfiles_espacio_idx').on(t.espacioId),
  // Los dos se ven entre si: la biblioteca necesita el nombre y el color del otro.
  pgPolicy('perfiles_lectura', {
    for: 'select',
    to: authenticatedRole,
    using: sql`espacio_id = ${miEspacio}`,
  }),
  // Cada uno edita solo el suyo (tema, color, nombre) y no puede mudarse de
  // espacio: el with check vuelve a fijar espacio_id.
  pgPolicy('perfiles_propio', {
    for: 'update',
    to: authenticatedRole,
    using: sql`id = ${yo}`,
    withCheck: sql`id = ${yo} and espacio_id = ${miEspacio}`,
  }),
]);

/** TMDB numera peliculas y series por separado: el 1399 es una cosa en cada lado. */
export const TIPOS = ['pelicula', 'serie'] as const;
export type Tipo = (typeof TIPOS)[number];

/**
 * Ficha de TMDB, global: una fila por pelicula o serie, no por pareja ni por
 * usuario. La clave es (tmdb_id, tipo) porque los ids de TMDB se repiten entre
 * peliculas y series. poster_path guarda el fragmento que devuelve TMDB ('/abc123.jpg'), no la URL
 * entera: la base de la URL cambia cada tanto y no queremos migrar filas.
 */
export const peliculas = pgTable('peliculas', {
  tmdbId: integer('tmdb_id').notNull(),
  tipo: text('tipo', { enum: TIPOS }).notNull().default('pelicula'),
  titulo: text('titulo').notNull(),
  tituloOriginal: text('titulo_original'),
  anio: smallint('anio'),
  duracionMin: smallint('duracion_min'),
  director: text('director'),
  generos: text('generos').array().notNull().default(sql`'{}'`),
  posterPath: text('poster_path'),
  sinopsis: text('sinopsis'),
  actualizadaEn: timestamp('actualizada_en', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.tmdbId, t.tipo] }),
  check('peliculas_tipo_valido', sql`${t.tipo} in ('pelicula', 'serie')`),
  // Las fichas de TMDB las lee cualquiera autenticado. Escribe solo el servidor,
  // desde el route handler, con la conexion privilegiada (`dbAdmin`): por eso no
  // hay politica de insert ni de update.
  pgPolicy('peliculas_lectura', {
    for: 'select',
    to: authenticatedRole,
    using: sql`true`,
  }),
]);

/**
 * La pelicula dentro de la libreta de una pareja. El paso de pendiente a vista
 * es un update de `estado`, no una fila nueva: asi no se pierde quien la sumo.
 */
export const entradas = pgTable('entradas', {
  id: uuid('id').primaryKey().defaultRandom(),
  espacioId: uuid('espacio_id')
    .notNull()
    .references(() => espacios.id, { onDelete: 'cascade' }),
  tmdbId: integer('tmdb_id').notNull(),
  tipo: text('tipo', { enum: TIPOS }).notNull().default('pelicula'),
  estado: text('estado', { enum: ['vista', 'pendiente'] }).notNull(),
  vistaEl: date('vista_el'),
  lugar: text('lugar'),
  agregadaPor: uuid('agregada_por')
    .notNull()
    .references(() => perfiles.id),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  // «La de esta noche»: la pendiente que salió elegida (al azar o jugando) y
  // espera arriba de la lista hasta que la marquen vista o la suelten.
  elegidaEn: timestamp('elegida_en', { withTimezone: true }),
}, (t) => [
  check('entradas_estado_valido', sql`${t.estado} in ('vista', 'pendiente')`),
  // A lo sumo una elegida por espacio: lo garantiza la base, no el código.
  uniqueIndex('entradas_elegida_uq').on(t.espacioId).where(sql`${t.elegidaEn} is not null`),
  foreignKey({
    name: 'entradas_ficha_fk',
    columns: [t.tmdbId, t.tipo],
    foreignColumns: [peliculas.tmdbId, peliculas.tipo],
  }),
  // Evita que la misma peli entre dos veces. Es lo que enciende el cartel
  // «Ya esta en la biblioteca» en la pantalla de busqueda.
  unique('entradas_espacio_tmdb_uq').on(t.espacioId, t.tmdbId, t.tipo),
  index('entradas_espacio_estado_idx').on(t.espacioId, t.estado, t.creadaEn.desc()),
  // La libreta: se lee y se escribe solo dentro del propio espacio.
  pgPolicy('entradas_rw', {
    for: 'all',
    to: authenticatedRole,
    using: sql`espacio_id = ${miEspacio}`,
    withCheck: sql`espacio_id = ${miEspacio}`,
  }),
]);

/**
 * Una fila por persona y por entrada. El promedio de la pareja es derivado:
 * nunca se guarda, sale de esta tabla.
 */
export const puntajes = pgTable('puntajes', {
  entradaId: uuid('entrada_id')
    .notNull()
    .references(() => entradas.id, { onDelete: 'cascade' }),
  perfilId: uuid('perfil_id')
    .notNull()
    .references(() => perfiles.id, { onDelete: 'cascade' }),
  // numeric(2,1), no entero: el diseno muestra medias estrellas (4,5).
  estrellas: numeric('estrellas', { precision: 2, scale: 1, mode: 'number' }).notNull(),
  comentario: text('comentario'),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.entradaId, t.perfilId] }),
  check('puntajes_estrellas_validas', sql`${t.estrellas} between 0.5 and 5`),
  index('puntajes_perfil_idx').on(t.perfilId),
  // Esta pareja de politicas es la que hace cumplir la regla del producto: los
  // dos ven las estrellas del otro, pero nadie puede editar las ajenas. Queda
  // garantizado en la base, sin importar que haga el cliente.
  pgPolicy('puntajes_lectura', {
    for: 'select',
    to: authenticatedRole,
    using: sql`exists (
      select 1 from public.entradas e
      where e.id = entrada_id and e.espacio_id = ${miEspacio}
    )`,
  }),
  pgPolicy('puntajes_escritura', {
    for: 'all',
    to: authenticatedRole,
    using: sql`perfil_id = ${yo}`,
    // El espacio tambien se chequea al escribir: si no, alguien podria colgar un
    // puntaje propio de una entrada ajena con solo conocer su id.
    withCheck: sql`perfil_id = ${yo} and exists (
      select 1 from public.entradas e
      where e.id = entrada_id and e.espacio_id = ${miEspacio}
    )`,
  }),
]);

export type Espacio = typeof espacios.$inferSelect;
export type Perfil = typeof perfiles.$inferSelect;
export type Pelicula = typeof peliculas.$inferSelect;
export type Entrada = typeof entradas.$inferSelect;
export type Puntaje = typeof puntajes.$inferSelect;

/**
 * Una «noche de peli»: la sesión en la que se elige qué ver. La misma fila es la
 * sesión en vivo (fases `esperando` → `candidatas` → `juego` → `jugando`) y,
 * cuando termina, el historial: quién ganó, con qué juego y qué peli salió.
 *
 * `estado` es lo que ven los dos celulares; `secreto` es lo que el servidor
 * necesita para arbitrar y no conviene mostrar (la jugada del otro antes de
 * revelar, la palabra del Wordle, el título del ahorcado). Realtime igual manda
 * la fila entera: el secreto queda escondido de la pantalla, no de las
 * herramientas del navegador. Para dos personas que se tienen confianza es el
 * mismo umbral que el resto de la app.
 *
 * `version` sube en cada transición: el cliente descarta eventos que lleguen
 * fuera de orden.
 */
export const noches = pgTable('noches', {
  id: uuid('id').primaryKey().defaultRandom(),
  espacioId: uuid('espacio_id')
    .notNull()
    .references(() => espacios.id, { onDelete: 'cascade' }),
  modo: text('modo', { enum: MODOS_NOCHE }).$type<Modo>().notNull(),
  fase: text('fase', { enum: FASES_NOCHE }).$type<Fase>().notNull(),
  juego: text('juego', { enum: JUEGOS }).$type<Juego>(),
  creadaPor: uuid('creada_por')
    .notNull()
    .references(() => perfiles.id, { onDelete: 'cascade' }),
  // Null con fase `terminada` y modo `duo` = coincidieron sin jugar.
  ganadorId: uuid('ganador_id').references(() => perfiles.id, { onDelete: 'set null' }),
  // La elegida. Si después la borran de la libreta, el historial la recuerda
  // como «una que ya no está».
  entradaId: uuid('entrada_id').references(() => entradas.id, { onDelete: 'set null' }),
  estado: jsonb('estado').$type<EstadoNoche>().notNull().default(sql`'{}'::jsonb`),
  secreto: jsonb('secreto').$type<SecretoNoche>().notNull().default(sql`'{}'::jsonb`),
  version: integer('version').notNull().default(0),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadaEn: timestamp('actualizada_en', { withTimezone: true }).notNull().defaultNow(),
  terminadaEn: timestamp('terminada_en', { withTimezone: true }),
}, (t) => [
  check('noches_modo_valido', sql`${t.modo} in ('individual', 'duo')`),
  check(
    'noches_fase_valida',
    sql`${t.fase} in ('esperando', 'candidatas', 'juego', 'jugando', 'terminada', 'cancelada')`,
  ),
  check(
    'noches_juego_valido',
    sql`${t.juego} is null or ${t.juego} in ('ppt', 'memoria', 'ahorcado', 'wordle', 'moneda')`,
  ),
  // Una sesión viva por espacio. Es lo que hace seguro que los dos toquen
  // «De a dos» al mismo tiempo: el segundo insert choca y se queda con la primera.
  uniqueIndex('noches_activa_uq')
    .on(t.espacioId)
    .where(sql`${t.fase} not in ('terminada', 'cancelada')`),
  index('noches_historial_idx').on(t.espacioId, t.terminadaEn.desc()),
  // Igual que la libreta: se lee y se escribe solo dentro del propio espacio.
  pgPolicy('noches_rw', {
    for: 'all',
    to: authenticatedRole,
    using: sql`espacio_id = ${miEspacio}`,
    withCheck: sql`espacio_id = ${miEspacio}`,
  }),
]);

export type Noche = typeof noches.$inferSelect;

/**
 * El link con el que la otra persona se suma a la libreta. Se guarda el hash del
 * token, no el token: con la tabla sola no se puede armar un link que ande.
 *
 * RLS prendida y sin políticas: desde el navegador no se lee ni se escribe. La
 * maneja solo el servidor, con la conexión privilegiada.
 */
export const invitaciones = pgTable('invitaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  espacioId: uuid('espacio_id')
    .notNull()
    .references(() => espacios.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  creadaPor: uuid('creada_por')
    .notNull()
    .references(() => perfiles.id, { onDelete: 'cascade' }),
  venceEn: timestamp('vence_en', { withTimezone: true }).notNull(),
  usadaEn: timestamp('usada_en', { withTimezone: true }),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

/* ---------------------------------------------------------------------------
   Las vistas se crean en SQL (migracion 0001, porque drizzle-kit no genera
   vistas ni funciones), pero se declaran aca con `.existing()` para poder
   consultarlas con tipos desde el query builder.
--------------------------------------------------------------------------- */

export const vEntradasPuntuadas = pgView('v_entradas_puntuadas', {
  id: uuid('id').notNull(),
  espacioId: uuid('espacio_id').notNull(),
  tmdbId: integer('tmdb_id').notNull(),
  tipo: text('tipo', { enum: TIPOS }).notNull(),
  estado: text('estado', { enum: ['vista', 'pendiente'] }).notNull(),
  vistaEl: date('vista_el'),
  lugar: text('lugar'),
  agregadaPor: uuid('agregada_por').notNull(),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull(),
  elegidaEn: timestamp('elegida_en', { withTimezone: true }),
  titulo: text('titulo').notNull(),
  anio: smallint('anio'),
  duracionMin: smallint('duracion_min'),
  generos: text('generos').array().notNull(),
  posterPath: text('poster_path'),
  // avg() sobre numeric: null mientras nadie la haya puntuado.
  promedio: numeric('promedio', { mode: 'number' }),
  cuantosPuntuaron: bigint('cuantos_puntuaron', { mode: 'number' }).notNull(),
}).existing();

export const vPorGenero = pgView('v_por_genero', {
  espacioId: uuid('espacio_id').notNull(),
  genero: text('genero').notNull(),
  cantidad: bigint('cantidad', { mode: 'number' }).notNull(),
}).existing();

export type EntradaPuntuada = typeof vEntradasPuntuadas.$inferSelect;
export type ConteoGenero = typeof vPorGenero.$inferSelect;
