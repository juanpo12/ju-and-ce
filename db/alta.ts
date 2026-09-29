/**
 * Crea la libreta y suma personas. Es un script de consola porque `perfiles` no
 * tiene política de insert: el alta la hace el servidor, nunca el navegador.
 *
 *   npm run alta -- --crear "Juan y Ceci"
 *   npm run alta -- --sumar <user-id> --nombre Juan --color durazno
 *   npm run alta -- --listar
 *
 * El user-id sale de la pantalla /sin-libreta, que es lo que ve alguien que
 * entró con el magic link pero todavía no está en ninguna libreta. O sea: cada
 * uno entra una vez, te pasa el código, y vos lo sumás.
 */
import { eq } from 'drizzle-orm';
import { dbAdmin, espacios, perfiles } from './index';

const args = process.argv.slice(2);
const opcion = (nombre: string) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const aCrear = opcion('crear');
const aSumar = opcion('sumar');

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

El <user-id> lo muestra la pantalla /sin-libreta al que entró con el magic link.`);
process.exit(0);
