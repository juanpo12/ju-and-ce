/**
 * Corre los casos de RLS contra un Postgres de verdad levantado dentro del
 * proceso (PGlite). No hace falta docker, ni credenciales, ni el proyecto de
 * Supabase: es la prueba que podes correr en cada cambio de esquema.
 *
 *   npm run db:test
 *
 * Lo que NO cubre: el pooler, los grants reales de Supabase y el JWT de verdad.
 * Para eso esta `npm run db:test:supabase`.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql, type SQL } from 'drizzle-orm';
import * as schema from '../schema';
import { correrCasos, type Ctx, type Db } from './casos';

const aqui = new URL('.', import.meta.url).pathname;
const pg = await PGlite.create();

console.log('Levantando Postgres en proceso…');
await pg.exec(await readFile(join(aqui, 'shim-supabase.sql'), 'utf8'));

const dir = join(aqui, '..', 'migrations');
for (const archivo of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
  const texto = await readFile(join(dir, archivo), 'utf8');
  console.log(`  aplicando ${archivo}`);
  for (const stmt of texto.split('--> statement-breakpoint')) {
    if (stmt.trim()) await pg.exec(stmt);
  }
}

const local = drizzle(pg, { schema });

const comoUsuario: Ctx['comoUsuario'] = (userId, fn) =>
  local.transaction(async (tx) => {
    const claims = JSON.stringify({ sub: userId, role: 'authenticated' });
    await tx.execute(sql`select set_config('request.jwt.claims', ${claims}, true)`);
    await tx.execute(sql`set local role authenticated`);
    return fn(tx as unknown as Db);
  });

// PGlite devuelve `{ rows }`; postgres-js devuelve el array pelado.
const filas: Ctx['filas'] = async <T>(db: Db, consulta: SQL) =>
  ((await db.execute(consulta)) as unknown as { rows: T[] }).rows;

// Las tres peliculas del seed: los casos las necesitan para colgarles entradas.
await pg.exec(`
  insert into peliculas (tmdb_id, titulo, anio, duracion_min, director, generos) values
    (157336, 'Interestelar',        2014, 169, 'Christopher Nolan', '{"Aventura","Drama","Ciencia ficción"}'),
    (496243, 'Parásitos',           2019, 132, 'Bong Joon-ho',      '{"Comedia","Thriller","Drama"}'),
    (129,    'El viaje de Chihiro', 2001, 125, 'Hayao Miyazaki',    '{"Animación","Familia","Fantasía"}')
  on conflict do nothing;`);

const dbAdmin = local as unknown as Db;
const { fallos } = await correrCasos({ dbAdmin, comoUsuario, filas });
await pg.close();
process.exit(fallos === 0 ? 0 : 1);
