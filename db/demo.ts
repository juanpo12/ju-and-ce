/**
 * Levanta un Postgres de juguete (PGlite, en proceso) hablando el protocolo de
 * Postgres en un puerto, le aplica las migraciones de verdad y lo siembra con
 * datos de ejemplo. Después arranca `next dev` apuntado ahí.
 *
 *   npm run demo
 *
 * La gracia de exponerlo por socket en vez de embeberlo: la app usa el mismo
 * driver y el mismo `DATABASE_URL` de siempre, así que no hay una sola línea de
 * código de producción que sepa que esto existe.
 */
import { spawn } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

// El de la app y el del Postgres de juguete, los dos configurables por si algo
// más está ocupando el puerto: PORT=4321 npm run demo
const PUERTO_APP = process.env.PORT ?? '3000';
const PUERTO = Number(process.env.PUERTO_DEMO_DB ?? 5433);
const aqui = new URL('.', import.meta.url).pathname;

const PERFIL_DEMO = '00000000-0000-4000-8000-00000000d3e0';
const CECI = '00000000-0000-4000-8000-00000000cec1';
const ESPACIO = '00000000-0000-4000-8000-0000000e5ace';

console.log('Levantando el Postgres de la demo…');
const pg = await PGlite.create();

await pg.exec(await readFile(join(aqui, 'pruebas/shim-supabase.sql'), 'utf8'));

const dir = join(aqui, 'migrations');
for (const archivo of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
  const texto = await readFile(join(dir, archivo), 'utf8');
  for (const stmt of texto.split('--> statement-breakpoint')) {
    if (stmt.trim()) await pg.exec(stmt);
  }
}

// La demo entra sin login, así que el usuario tiene que existir igual: el resto
// del esquema lo referencia.
await pg.exec(`
  insert into auth.users (id, email, aud, role) values
    ('${PERFIL_DEMO}'::uuid, 'juan@demo.local', 'authenticated', 'authenticated'),
    ('${CECI}'::uuid,        'ceci@demo.local', 'authenticated', 'authenticated');

  insert into espacios (id, nombre) values ('${ESPACIO}'::uuid, 'Juan y Ceci');

  insert into perfiles (id, espacio_id, nombre, color, tema) values
    ('${PERFIL_DEMO}'::uuid, '${ESPACIO}'::uuid, 'Juan', 'durazno', 'menta'),
    ('${CECI}'::uuid,        '${ESPACIO}'::uuid, 'Ceci', 'menta',   'papel');

  -- Sin TMDB_API_KEY no hay póster: esos paths los sabe TMDB y no tiene sentido
  -- inventarlos. En la demo se ve el marcador de claqueta.
  insert into peliculas (tmdb_id, titulo, titulo_original, anio, duracion_min, director, generos, sinopsis) values
    (157336, 'Interestelar', 'Interstellar', 2014, 169, 'Christopher Nolan',
      '{"Aventura","Drama","Ciencia ficción"}',
      'Un grupo de exploradores atraviesa un agujero de gusano buscando un futuro para la humanidad.'),
    (496243, 'Parásitos', '기생충', 2019, 132, 'Bong Joon-ho',
      '{"Comedia","Thriller","Drama"}',
      'Toda la familia Kim está sin trabajo, hasta que el hijo mayor consigue entrar en una casa rica.'),
    (129, 'El viaje de Chihiro', '千と千尋の神隠し', 2001, 125, 'Hayao Miyazaki',
      '{"Animación","Familia","Fantasía"}',
      'Una nena de diez años queda atrapada en un mundo de espíritus y tiene que trabajar para volver.'),
    (490132, 'Green Book', 'Green Book', 2018, 130, 'Peter Farrelly',
      '{"Drama","Comedia"}', 'Un chofer italoamericano maneja para un pianista negro por el sur de 1962.'),
    (313369, 'La La Land', 'La La Land', 2016, 128, 'Damien Chazelle',
      '{"Drama","Musical","Romance"}', 'Una actriz y un pianista de jazz se enamoran mientras persiguen lo suyo.'),
    (614934, 'Elvis', 'Elvis', 2022, 159, 'Baz Luhrmann',
      '{"Drama","Música"}', 'La vida de Elvis Presley vista desde su representante.'),
    (976893, 'Perfect Days', 'Perfect Days', 2023, 124, 'Wim Wenders',
      '{"Drama"}', 'Un hombre limpia baños públicos en Tokio y encuentra belleza en la rutina.'),
    (915935, 'Anatomía de una caída', 'Anatomie d''une chute', 2023, 151, 'Justine Triet',
      '{"Drama","Thriller","Policial"}', 'Una escritora es juzgada por la muerte de su marido.');

  insert into entradas (id, espacio_id, tmdb_id, estado, vista_el, lugar, agregada_por) values
    ('11111111-0000-4000-8000-000000000001'::uuid, '${ESPACIO}'::uuid, 157336, 'vista', '2026-09-14', 'el sillón',    '${PERFIL_DEMO}'::uuid),
    ('11111111-0000-4000-8000-000000000002'::uuid, '${ESPACIO}'::uuid, 496243, 'vista', '2026-08-30', 'el cine',      '${CECI}'::uuid),
    ('11111111-0000-4000-8000-000000000003'::uuid, '${ESPACIO}'::uuid, 129,    'vista', '2026-08-12', 'el sillón',    '${CECI}'::uuid),
    ('11111111-0000-4000-8000-000000000004'::uuid, '${ESPACIO}'::uuid, 490132, 'vista', '2026-07-21', 'lo de mamá',   '${PERFIL_DEMO}'::uuid),
    ('11111111-0000-4000-8000-000000000005'::uuid, '${ESPACIO}'::uuid, 313369, 'vista', '2026-06-05', 'el sillón',    '${PERFIL_DEMO}'::uuid),
    ('11111111-0000-4000-8000-000000000006'::uuid, '${ESPACIO}'::uuid, 614934, 'vista', '2026-05-18', 'el cine',      '${CECI}'::uuid),
    ('11111111-0000-4000-8000-000000000007'::uuid, '${ESPACIO}'::uuid, 976893, 'pendiente', null, null,               '${CECI}'::uuid),
    ('11111111-0000-4000-8000-000000000008'::uuid, '${ESPACIO}'::uuid, 915935, 'pendiente', null, null,               '${PERFIL_DEMO}'::uuid);

  insert into puntajes (entrada_id, perfil_id, estrellas, comentario) values
    ('11111111-0000-4000-8000-000000000001'::uuid, '${PERFIL_DEMO}'::uuid, 5,   'La mejor que vimos este año. El final me dejó hecho pelota.'),
    ('11111111-0000-4000-8000-000000000001'::uuid, '${CECI}'::uuid,        4,   'Larga, pero vale la pena. Lloré con lo del reloj.'),
    ('11111111-0000-4000-8000-000000000002'::uuid, '${PERFIL_DEMO}'::uuid, 4.5, null),
    ('11111111-0000-4000-8000-000000000002'::uuid, '${CECI}'::uuid,        5,   'No me esperaba nada de lo que pasó.'),
    ('11111111-0000-4000-8000-000000000003'::uuid, '${CECI}'::uuid,        5,   'La volvería a ver mañana.'),
    ('11111111-0000-4000-8000-000000000004'::uuid, '${PERFIL_DEMO}'::uuid, 4,   'Previsible pero linda.'),
    ('11111111-0000-4000-8000-000000000004'::uuid, '${CECI}'::uuid,        3.5, null),
    ('11111111-0000-4000-8000-000000000005'::uuid, '${PERFIL_DEMO}'::uuid, 3.5, 'La música sí, la historia meh.'),
    ('11111111-0000-4000-8000-000000000005'::uuid, '${CECI}'::uuid,        4.5, 'A mí me encantó, no le des bola.'),
    ('11111111-0000-4000-8000-000000000006'::uuid, '${CECI}'::uuid,        3,   'Demasiado larga.');
`);

const servidor = new PGLiteSocketServer({ db: pg, port: PUERTO, host: '127.0.0.1' });
await servidor.start();
console.log(`Postgres de la demo en 127.0.0.1:${PUERTO}\n`);

const next = spawn('npx', ['next', 'dev', '--port', PUERTO_APP, '--hostname', '0.0.0.0'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: `postgres://postgres:postgres@127.0.0.1:${PUERTO}/postgres`,
    // PGlite atiende una conexión por vez: con el pool por defecto, la mitad de
    // las queries se cortan con ECONNRESET.
    DATABASE_MAX_CONEXIONES: '1',
    NEXT_PUBLIC_LIBRETA_DEMO: '1',
    // La app no los usa en demo, pero se importan igual al cargar los módulos.
    NEXT_PUBLIC_SUPABASE_URL: 'http://demo.local',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'demo',
  },
});

const cerrar = async () => {
  next.kill();
  await servidor.stop();
  await pg.close();
  process.exit(0);
};
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
next.on('exit', cerrar);
