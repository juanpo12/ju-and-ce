import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

type Cliente = ReturnType<typeof drizzle<typeof schema>>;

let conexion: Cliente | undefined;

/**
 * La conexión se abre en el primer uso, no al importar el módulo. Dos motivos:
 * el build de Next importa estos archivos para recolectar rutas y no tiene (ni
 * necesita) las credenciales, y en serverless conviene no hacer trabajo hasta
 * que haya de verdad un request.
 */
function abrir(): Cliente {
  if (conexion) return conexion;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL (pooler de Supabase, puerto 6543).');

  // El pooler en modo transacción no soporta prepared statements. Sin este
  // `prepare: false` anda perfecto en desarrollo y falla en producción con
  // errores de prepared statement, que es la peor clase de bug.
  conexion = drizzle(
    postgres(url, {
      prepare: false,
      // Cuántas conexiones abre este proceso contra el pooler. El default de
      // postgres.js (10) está bien en Vercel; se baja por variable cuando del
      // otro lado hay algo que acepta menos.
      max: Number(process.env.DATABASE_MAX_CONEXIONES ?? 10),
    }),
    { schema },
  );
  return conexion;
}

/**
 * Conexión privilegiada: entra como dueño de la base, así que **la RLS no se
 * aplica**. Usala solo para lo que de verdad es del servidor:
 *   - escribir la ficha de TMDB en `peliculas`,
 *   - crear el espacio y los perfiles al dar de alta a alguien,
 *   - migraciones y seeds.
 * Cualquier lectura o escritura que represente a un usuario va por
 * `comoUsuario()`.
 */
export const dbAdmin: Cliente = new Proxy({} as Cliente, {
  get(_, prop) {
    const real = abrir();
    const valor = Reflect.get(real, prop) as unknown;
    // El bind importa: los métodos de drizzle usan `this`.
    return typeof valor === 'function' ? valor.bind(real) : valor;
  },
});

/**
 * Corre las queries como el usuario `userId`, dentro de una transacción que fija
 * el rol `authenticated` y los claims del JWT — que es exactamente lo que leen
 * las políticas. Es la opción A del plan: la seguridad sigue viviendo en la base.
 *
 * `set local` y `set_config(..., true)` duran lo que dura la transacción, así que
 * la conexión vuelve limpia al pool al terminar.
 */
export async function comoUsuario<T>(
  userId: string,
  fn: (tx: Parameters<Parameters<Cliente['transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  return abrir().transaction(async (tx) => {
    const claims = JSON.stringify({ sub: userId, role: 'authenticated' });
    await tx.execute(sql`select set_config('request.jwt.claims', ${claims}, true)`);
    await tx.execute(sql`set local role authenticated`);
    return fn(tx);
  });
}

export { schema };
export * from './schema';
