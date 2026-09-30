import {
  bigint,
  check,
  date,
  index,
  integer,
  numeric,
  pgPolicy,
  pgTable,
  pgView,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
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

/**
 * Ficha de TMDB, global: una fila por pelicula, no por pareja ni por usuario.
 * poster_path guarda el fragmento que devuelve TMDB ('/abc123.jpg'), no la URL
 * entera: la base de la URL cambia cada tanto y no queremos migrar filas.
 */
export const peliculas = pgTable('peliculas', {
  tmdbId: integer('tmdb_id').primaryKey(),
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
}, () => [
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
  tmdbId: integer('tmdb_id')
    .notNull()
    .references(() => peliculas.tmdbId),
  estado: text('estado', { enum: ['vista', 'pendiente'] }).notNull(),
  vistaEl: date('vista_el'),
  lugar: text('lugar'),
  agregadaPor: uuid('agregada_por')
    .notNull()
    .references(() => perfiles.id),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check('entradas_estado_valido', sql`${t.estado} in ('vista', 'pendiente')`),
  // Evita que la misma peli entre dos veces. Es lo que enciende el cartel
  // «Ya esta en la biblioteca» en la pantalla de busqueda.
  unique('entradas_espacio_tmdb_uq').on(t.espacioId, t.tmdbId),
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
  estado: text('estado', { enum: ['vista', 'pendiente'] }).notNull(),
  vistaEl: date('vista_el'),
  lugar: text('lugar'),
  agregadaPor: uuid('agregada_por').notNull(),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull(),
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
