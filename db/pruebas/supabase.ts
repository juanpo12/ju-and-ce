/**
 * Los mismos casos, contra el proyecto de Supabase de verdad. Necesita
 * DATABASE_URL y las migraciones ya aplicadas (`npm run db:migrate`).
 *
 *   npm run db:test:supabase
 *
 * Corre sobre la base real, asi que crea y borra sus propios fixtures — usuarios
 * de prueba incluidos. No lo apuntes a nada que no sea tu proyecto.
 */
import { sql, type SQL } from 'drizzle-orm';
import { dbAdmin, comoUsuario } from '../index';
import { correrCasos, type Ctx, type Db } from './casos';

const filas: Ctx['filas'] = async <T>(db: Db, consulta: SQL) =>
  (await db.execute(consulta)) as unknown as T[];

const { fallos } = await correrCasos({
  dbAdmin: dbAdmin as unknown as Db,
  comoUsuario: comoUsuario as unknown as Ctx['comoUsuario'],
  filas,
});
process.exit(fallos === 0 ? 0 : 1);
