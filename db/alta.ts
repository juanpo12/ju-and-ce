/**
 * Crea la libreta y suma personas. Es un script de consola porque `perfiles` no
 * tiene política de insert: el alta la hace el servidor, nunca el navegador.
 *
 *   npm run alta -- --crear "Juan y Ceci"
 *   npm run alta -- --sumar <user-id> --nombre Juan --color durazno
 *   npm run alta -- --listar
 *   npm run alta -- --clave vos@mail.com
 *
 * La otra persona no pasa por acá: se suma con el link de invitación que se
 * genera desde Ajustes. `--sumar` queda para una cuenta creada a mano desde el
 * panel de Supabase. `--clave` pone o cambia una contraseña sin saber la
 * anterior.
 */
import { eq, sql } from 'drizzle-orm';
import { dbAdmin, espacios, perfiles } from './index';

const args = process.argv.slice(2);
const opcion = (nombre: string) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const aCrear = opcion('crear');
const aSumar = opcion('sumar');

const aClave = opcion('clave');

if (aClave) {
  // La contraseña se pide acá y no por argumento: así no queda en el historial
  // de la terminal. Va por la API de admin porque el registro público está
  // apagado y porque no hace falta saber la anterior.
  const { createClient } = await import('@supabase/supabase-js');
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!clave) {
    console.error('Falta SUPABASE_SECRET_KEY en .env (Supabase → Settings → API Keys).');
    process.exit(1);
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [usuario] = (await dbAdmin.execute(
    sql`select id from auth.users where lower(email) = lower(${aClave})`,
  )) as unknown as { id: string }[];
  if (!usuario) {
    console.error(`No hay ninguna cuenta con ${aClave}.`);
    process.exit(1);
  }

  const nueva = await preguntarOculto('Contraseña nueva (8+ caracteres): ');
  if (nueva.length < 8) {
    console.error('Tiene que tener al menos 8 caracteres.');
    process.exit(1);
  }
  const { error } = await admin.auth.admin.updateUserById(usuario.id, { password: nueva });
  if (error) {
    console.error(`No se pudo: ${error.message}`);
    process.exit(1);
  }
  console.log(`Listo: ${aClave} ya entra con esa contraseña.`);
  process.exit(0);
}

if (args.includes('--listar')) {
  const filas = await dbAdmin
    .select({
      espacio: espacios.nombre,
      espacioId: espacios.id,
      perfil: perfiles.nombre,
      perfilId: perfiles.id,
      color: perfiles.color,
    })
    .from(espacios)
    .leftJoin(perfiles, eq(perfiles.espacioId, espacios.id));

  if (filas.length === 0) {
    console.log('No hay ninguna libreta todavía. Creá una con --crear "Nombre".');
  }
  for (const f of filas) {
    console.log(`${f.espacio}  (${f.espacioId})`);
    if (f.perfil) console.log(`   · ${f.perfil}  ${f.color}  ${f.perfilId}`);
  }
  process.exit(0);
}

if (aCrear) {
  const [fila] = await dbAdmin.insert(espacios).values({ nombre: aCrear }).returning();
  console.log(`Libreta «${fila!.nombre}» creada.`);
  console.log(`   id: ${fila!.id}`);
  console.log('\nAhora que cada uno entre una vez con su mail y te pase su código.');
  process.exit(0);
}

if (aSumar) {
  const nombre = opcion('nombre');
  if (!nombre) {
    console.error('Falta --nombre. Ej: npm run alta -- --sumar <id> --nombre Juan');
    process.exit(1);
  }

  const todas = await dbAdmin.select().from(espacios);
  if (todas.length === 0) {
    console.error('No hay ninguna libreta. Creá una primero con --crear "Nombre".');
    process.exit(1);
  }

  const espacioId = opcion('espacio') ?? todas[0]!.id;
  if (todas.length > 1 && !opcion('espacio')) {
    console.error('Hay más de una libreta: pasá --espacio <id>. Verlas con --listar.');
    process.exit(1);
  }

  // El color distingue a los dos en la biblioteca y en pendientes.
  const yaHay = await dbAdmin.select().from(perfiles).where(eq(perfiles.espacioId, espacioId));
  const color = opcion('color') ?? (yaHay.length === 0 ? 'durazno' : 'menta');

  await dbAdmin
    .insert(perfiles)
    .values({ id: aSumar, espacioId, nombre, color })
    .onConflictDoUpdate({ target: perfiles.id, set: { nombre, color, espacioId } });

  console.log(`${nombre} quedó en «${todas.find((e) => e.id === espacioId)!.nombre}» (${color}).`);
  console.log('Que recargue /sin-libreta y ya entra.');
  process.exit(0);
}

console.log(`Uso:
  npm run alta -- --crear "Juan y Ceci"
  npm run alta -- --sumar <user-id> --nombre Juan [--color durazno] [--espacio <id>]
  npm run alta -- --listar
  npm run alta -- --clave <mail>

Para sumar a la otra persona no hace falta el script: el link de invitación se
genera desde Ajustes.`);
process.exit(0);

/** Lee una línea de la terminal sin mostrar lo que se escribe. */
function preguntarOculto(pregunta: string): Promise<string> {
  return new Promise((resolver) => {
    process.stdout.write(pregunta);
    const entrada = process.stdin;
    entrada.setRawMode?.(true);
    entrada.resume();
    entrada.setEncoding('utf8');
    let texto = '';
    const alTeclear = (tecla: string) => {
      for (const c of tecla) {
        if (c === '\r' || c === '\n') {
          entrada.setRawMode?.(false);
          entrada.pause();
          entrada.off('data', alTeclear);
          process.stdout.write('\n');
          resolver(texto);
          return;
        }
        if (c === '\u0003') process.exit(1); // ctrl+c
        if (c === '\u007f') texto = texto.slice(0, -1); // borrar
        else texto += c;
      }
    };
    entrada.on('data', alTeclear);
  });
}
