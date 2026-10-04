# Libreta de pelis

App privada para puntuar y comentar las películas que vemos. Cada uno tiene su
estrella y su comentario; el promedio sale de los dos. Ver [PLAN.md](PLAN.md)
para el diseño completo.

## Estado

Las seis fases del plan, terminadas. Falta enchufarle un proyecto de Supabase
real: hasta ahora se verificó con Postgres en proceso y con capturas del front.

## Verla ahora, sin Supabase

```bash
npm install
npm run demo        # http://localhost:3000
```

Levanta la app entera contra un Postgres de juguete (PGlite, en proceso) con las
migraciones de verdad aplicadas y datos de ejemplo: seis películas vistas con los
puntajes de los dos, dos pendientes, comentarios. Entra directo como «Juan», sin
login, y todo funciona — puntuar, filtrar, marcar una pendiente como vista.

Dos cosas que la demo no tiene: pósters (esos paths los sabe TMDB y no tiene
sentido inventarlos, así que se ve el marcador de claqueta) y Realtime, que
necesita un Supabase del otro lado.

El modo demo saltea el login, así que **nunca se enciende en producción**: el
chequeo de `NODE_ENV` en `lib/demo.ts` es la parte que importa.

## Poner a andar de verdad

```bash
npm install
cp .env.example .env        # y completar, ver abajo
npm run db:migrate          # crea tablas, RLS, vistas y resumen()
npm run db:seed             # tres películas
npm run alta -- --crear "Juan y Ceci"
npm run dev
```

Tu cuenta la creás desde el panel de Supabase (Authentication → Users → Add
user, con «Auto Confirm User») y la sumás a la libreta:

```bash
npm run alta -- --sumar <id-del-usuario> --nombre Juan
npm run alta -- --clave vos@mail.com      # pone o cambia la contraseña
```

A la otra persona la invitás desde **Ajustes → Invitar a la otra persona**: es un
link de un solo uso que vence en 7 días. Con él crea su cuenta (mail y
contraseña) y queda adentro de la libreta. Después, cada uno entra siempre con
mail y contraseña.

En Supabase → Authentication → Sign In / Providers, **apagá «Allow new users to
sign up»**. Así la única forma de tener cuenta es la invitación: con la URL de la
app sola no se entra.

### Las variables

| Variable | Dónde va | Para qué |
| --- | --- | --- |
| `DATABASE_URL` | Vercel + local | Pooler de Supabase, **puerto 6543** |
| `DIRECT_URL` | local | Conexión directa, **5432**, solo para `drizzle-kit` |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Pública, va al navegador |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Pública por diseño: la RLS es lo que protege |
| `TMDB_API_KEY` | Vercel + local | Solo servidor. Sin `NEXT_PUBLIC_`, **nunca** |
| `SUPABASE_SECRET_KEY` | Vercel + local | Solo servidor. Crea la cuenta al canjear una invitación |

### Deploy

Conectás el repo a Vercel, cargás las variables y cada push a `main` deploya
solo. El plan hobby sobra para dos personas.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run demo` | La app con datos de ejemplo, **sin Supabase** |
| `npm run dev` | La app en local, contra tu Supabase |
| `npm run db:test` | Levanta Postgres en proceso y prueba la RLS. **Sin credenciales** |
| `npm run db:test:supabase` | Los mismos casos contra el proyecto real |
| `npm run db:generate` | Regenera migraciones desde `db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones |
| `npm run db:seed` | Carga las tres películas |
| `npm run alta` | Crea la libreta y suma personas |
| `npm run iconos` | Regenera los PNG del manifest |
| `npm run games:test` | La lógica de los juegos de la noche de peli, sin base |
| `npm run words` | Regenera la lista de palabras del juego de la palabra |
| `npm run typecheck` | `tsc --noEmit` |

`npm run db:test` no necesita nada: corre Postgres 18 dentro de Node (PGlite) con
un shim mínimo de Supabase. Son 56 casos y es la prueba de cada cambio de
esquema.

## Cómo está armado

```
app/
  layout.tsx              fuentes, tema, el <html>
  entrar/                 mail y contraseña
  unirse/[token]/         el link de invitación: crea la cuenta
  sin-libreta/            tiene sesión pero nadie lo sumó todavía
  acciones.ts             todas las mutaciones ('use server')
  api/peliculas/          TMDB: GET busca, POST importa la ficha
  (libreta)/
    layout.tsx            nav + suscripción a Realtime
    page.tsx              Biblioteca
    peli/[id]/            Ficha
    agregar/ pendientes/ resumen/ ajustes/
    pendientes/noche/     la noche de peli: el dado, la sesión de a dos y los juegos
    jugar/                los mismos juegos sin peli de por medio
components/               Estrellas, Poster, TarjetaPeli, Nav, Boton, Vacio
db/
  schema.ts               las tablas, las políticas RLS y las vistas
  index.ts                los dos clientes: dbAdmin y comoUsuario()
  queries.ts              todo el acceso a datos
  migrations/             versionadas desde el día uno
  pruebas/                los 56 casos, en local y contra Supabase
lib/
  supabase/               client (navegador), server (cookies)
  sesion.ts               perfilActual() y exigirPerfil()
  tmdb.ts                 el cliente de TMDB, solo servidor
  movie-night.ts          los tipos y la máquina de estados de la noche de peli
  games/                  la lógica pura de cada juego, con sus pruebas
styles/temas.css          «papel» y todo lo que comparten los temas
styles/themes/            un archivo por tema, más el registro que usa el servidor
scripts/art/              los dibujos de los temas, en SVG generado
proxy.ts                  refresco de sesión y guardia de rutas
db/demo.ts                el Postgres de juguete de `npm run demo`
lib/demo.ts               el interruptor del modo demo
```

Esto es Next 16: lo que en las guías viejas es `middleware.ts` acá se llama
`proxy.ts`, con la función exportada como `proxy`. El renombre es de Next, no
una decisión nuestra, y hay mucho tutorial desactualizado dando vueltas.

### Los temas

Sesenta y cuatro, en nueve grupos, y no son modos oscuros: cada uno cambia
fondo, tipografía, radios, bordes, sombras, acento, ilustraciones y hasta los
colores con que se distingue a cada persona. Cada tema tiene su versión clara y
su versión oscura.

| Grupo | Temas |
| --- | --- |
| Cuadernos | Papel y washi, Bullet journal, Menta granizada, Tinta china, Pizarra, Mostaza y oliva, Chocolate caliente |
| De hadas | Jardín de hadas, Pradera de luz, Acuarela y estrellas, Guarida del dragón, Hada del hongo, Vuelo de mariposas, Campanitas |
| Salidas | Sala de cine, Videoclub, Marea, Atardecer, Frutilla y crema, Galaxia |
| Medievales | Pergamino, Castillo, Vitral, Taberna, Heráldica, Bosque de druidas, Alquimia |
| Pixel art | Arcade, Bolsillo verde, Aventura 16 bits, Mazmorra, Plataformas, Mundo de bloques, Ciudad 8 bits, Reino pixel |
| Dragones y reinos | Dragón de fuego, Dragón de hielo, Wyvern esmeralda, Tesoro del dragón, Mapa del reino, Torneo, Grimorio, Forja enana |
| Aliens y espacio | Invasión, Archivo clasificado, Planeta rojo, Nebulosa, Abducción, Estación orbital |
| Anime | Sakura, Shōnen, Manga, Chica mágica, Mecha, Neo Tokio, Espíritus del bosque, Samurái |
| Sorpresas | Vaporwave, Terminal, Dinosaurios, Piratas, Cómic, Noche de brujas, Lejano oeste |

Se guardan en `perfiles.tema`, no en el navegador, así cada uno tiene el suyo en
cualquier dispositivo. El `data-tema` lo escribe el layout del servidor en el
primer render: aplicarlo con JavaScript después de montar haría ver un flash del
tema equivocado.

**Que sean muchos no hace más lenta la app.** Cada tema vive en su propio
archivo, `styles/themes/<id>.ts`, y el layout mete en el HTML solo el CSS del
tema activo (unos 2 KB). Las ilustraciones son SVG sueltos en `public/textures/`
con un hash en el nombre: se bajan solo las del tema en uso y quedan en caché
para siempre. Las letras de cada tema se declaran con `next/font` sin precarga,
así que también baja solo la que se usa. Ninguna letra japonesa: cada una trae
más de cien `@font-face`, y ese CSS lo pagaría todo el mundo. Ajustes trae el CSS
de los otros temas recién cuando se los toca para probarlos (`/theme-css/<id>.css`).

Para agregar uno:

1. `lib/temas.ts` — sumarlo a `TEMAS` y a los nombres, con su grupo.
2. `styles/themes/<id>.ts` — el bloque claro (`html[data-tema='<id>']`) y el
   oscuro (`html.dark[data-tema='<id>']`) con todos los tokens. Si lleva
   dibujos, van en `scripts/art/<grupo>.ts` y se generan con
   `npm run themes:art -- <grupo>` (los de hadas, con `scripts/arte-hadas.py`).
3. `npm run themes:index` — registra el CSS y saca de ahí los hex de las
   muestras de Ajustes y de la barra del navegador. Nadie los copia a mano.
4. `npm run themes:test` — contrastes WCAG en los dos modos, muestras, texturas
   y letras. Tiene que pasar.
5. `npm run db:generate` — el check `perfiles_tema_valido` sale de `TEMAS`, así
   que esto arma la migración solo.

### Las cuatro decisiones que hay que conocer

**El esquema de Drizzle es la única fuente de verdad.** Nada de tocar tablas ni
políticas desde la UI de Supabase. Las políticas están declaradas con `pgPolicy`
en `db/schema.ts`, así que `drizzle-kit generate` también las versiona. Las
vistas y las funciones van en SQL a mano (`0001`), porque drizzle-kit no las
genera, y se declaran con `.existing()` para consultarlas con tipos.

**Dos clientes de base, y no son intercambiables** (`db/index.ts`):

- `comoUsuario(userId, fn)` abre una transacción, fija `set local role
  authenticated` y los claims del JWT, y ahí corre las queries. Las políticas
  aplican igual que si vinieran del navegador. Todo lo que representa a un
  usuario va por acá.
- `dbAdmin` entra como dueño de la base y **la RLS no se aplica**. Solo para lo
  que es genuinamente del servidor: fichas de TMDB, alta de perfiles, seeds.

**Las mutaciones son server actions, no `supabase-js` desde el navegador.** El
plan proponía lo segundo; preferí lo primero porque deja el acceso a datos en un
solo archivo (`db/queries.ts`), con los tipos saliendo del esquema, en vez de
duplicarlo en dos clientes distintos. La seguridad no cambia: las actions pasan
por `comoUsuario()` y atraviesan la misma RLS. `supabase-js` en el navegador
quedó para lo que sí le corresponde — la sesión y el websocket de Realtime.

**El `prepare: false` no se toca.** El pooler en modo transacción no soporta
prepared statements: sin eso anda en desarrollo y falla en producción.

## Dónde me aparté del plan

El SQL del plan tenía cuatro agujeros que las pruebas dejaron a la vista:

1. **`security_invoker = on` en las dos vistas.** El plan dice que «las vistas
   heredan la RLS de las tablas de abajo». No es cierto por defecto: una vista
   corre con los permisos de quien la creó y saltea la RLS. Sin esa cláusula, el
   test muestra a Juan viendo 4 entradas en vez de 3 — la cuarta es de otra
   pareja.
2. **`perfiles` tenía RLS habilitada y ninguna política**, o sea que nadie podía
   leer ni su propio nombre.
3. **`espacios` no tenía RLS.**
4. **`puntajes_escritura` ahora chequea también el espacio.** Con el `with check`
   del plan, alguien podía colgar un puntaje propio de una entrada ajena con solo
   conocer su id.

Y dos cosas que aparecieron construyendo el front:

5. **Sesión sin perfil era un bucle de redirects.** `exigirPerfil()` mandaba a
   `/entrar`, el middleware veía un usuario válido y rebotaba a `/`, y de ahí
   otra vez. Por eso existe `/sin-libreta`.
6. **Las clases de `next/font` van en el `<html>`, no en el `<body>`.** Definen
   `--font-caveat` y compañía, y `styles/temas.css` las consume desde `:root`. En
   el `<body>` quedan un nivel por debajo y no resuelven: las variables CSS
   heredan hacia abajo, nunca hacia arriba. El síntoma era la app entera con la
   tipografía de fallback.

Menor: `estado` y `estrellas` llevan `check` explícito en la base (el `enum` de
Drizzle es solo de TypeScript), `mi_espacio()` va con `search_path = ''` como
pide el linter de Supabase, y la búsqueda de TMDB devuelve `director` y
`duracion_min` en null porque `/search` no los trae — se completan al importar,
que es lo que el propio plan explica dos párrafos después del contrato JSON.

### La noche de peli

Desde Pendientes, «Noche de peli» elige qué ver. Dos modos:

- **Que elija el dado.** Un celular: filtros opcionales (peli o serie, género,
  duración) y un sorteo. «Que sea esta» la deja arriba de Pendientes como «la de
  esta noche» hasta que la marquen vista o la suelten.
- **De a dos.** Cada uno en su celular. Uno abre la sesión, el otro la ve
  aparecer en Pendientes y entra. Cada uno propone una candidata (de la lista o
  al azar); si coinciden, listo; si no, se define jugando: piedra, papel o
  tijera (al mejor de 3), memoria (un tablero con pósters de lo que ya vieron),
  ahorcado (un título de la biblioteca, por turnos), la palabra (la misma de
  cinco letras para los dos, menos intentos gana), tateti, dados (al mejor de
  3), la trivia de la libreta (cinco preguntas sobre lo que ya vieron: años,
  directores, duración, quién puso más estrellas), mayor o menor (las mismas
  cartas para los dos, la racha más larga gana), cuatro en línea, nim (el que
  saca el último fósforo pierde), puntos y cajas, la carta maldita (doce boca
  abajo, el que da vuelta la maldita pierde), carrera de taps (diez segundos),
  el número secreto (el más cercano al que sale), simón dice, batalla naval
  (6×6, barcos puestos al azar), adiviná el póster (uno de la biblioteca que se
  va aclarando) y línea de tiempo (ordenar cinco vistas por año), o la moneda.
  Los empates los define la moneda, y en cualquier juego se puede rendir: gana
  el otro. Solo la memoria, el ahorcado, la trivia, el póster y la línea de
  tiempo necesitan pelis vistas; el resto no depende de la libreta.

  Y catorce más que no tienen nada que ver con películas: pares o nones, por
  uno (el que juega uno menos se lleva todo), robar o compartir, subasta,
  reversi, cinco en línea, mancala, generala, dados mentirosos, duelo del oeste
  (el primero en disparar después de «¡FUEGO!»), colores (tocar la tinta, no la
  palabra), anagrama, dibujá y adiviná, y ¿cuánto me conocés?. Se juegan igual
  desde la noche de peli o desde la pestaña Jugar, sin peli de por medio.

  Esos catorce son **módulos**: cada uno vive en `lib/games/<id>.ts` (reglas,
  con un `GameModule` de `lib/games/module.ts`), su prueba al lado, y su
  pantalla en `pendientes/noche/games/`. Para sumar otro: el id en
  `MODULAR_GAMES` (`lib/movie-night.ts`) con su nombre, el módulo en
  `lib/games/modules.ts`, la pantalla en `games/registry.tsx`, y
  `npm run db:generate` (el check de `noches.juego` sale de `GAMES`). Lo que solo
  puede ver un jugador (sus dados, la palabra a dibujar) sale por
  `privateView` y la pantalla lo lee con `usePrivateView`.

  Para probarlos sin dos celulares: `/jugar/simulador` (solo en dev y en la
  demo) corre la lógica en el navegador y deja jugar los dos lugares.

La sesión es una fila de `noches` con el estado como `jsonb`. Toda transición
pasa por `transitionNight()` en `db/queries.ts`, que lee la fila con
`for update`, aplica la regla y sube `version`: dos jugadas simultáneas se
serializan. Los dos celulares la siguen por un canal propio de Realtime
(`NightSession.tsx`), que adopta una fila solo si su `version` es mayor. Lo que
el servidor necesita para arbitrar y no conviene mostrar (la jugada del otro
antes de revelar, la palabra, el título) va en `secreto`, que se saca antes de
responder; Realtime igual manda la fila entera, así que queda escondido de la
pantalla, no de las herramientas del navegador. La fila terminada es el
historial, y Resumen cuenta quién ganó cuántas.

En la demo anda el dado; la sesión de a dos necesita Supabase, porque no hay
Realtime. Para que ande en Supabase, `noches` tiene que estar en la publicación
`supabase_realtime`: la migración 0008 la agrega si la publicación existe, y
conviene verificarlo en Database → Publications.

## Qué falta

- Correr las migraciones contra Supabase de verdad y pasar
  `npm run db:test:supabase`.
- Notificaciones push: iOS ya las soporta en PWAs agregadas al inicio. Con un
  trigger de Postgres, «Ceci puntuó Perfect Days» es lo primero que agregaría.
- Un service worker que cachee el shell y los pósters.
