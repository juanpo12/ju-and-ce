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
| `npm run typecheck` | `tsc --noEmit` |

`npm run db:test` no necesita nada: corre Postgres 18 dentro de Node (PGlite) con
un shim mínimo de Supabase. Son 37 casos y es la prueba de cada cambio de
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
components/               Estrellas, Poster, TarjetaPeli, Nav, Boton, Vacio
db/
  schema.ts               las cinco tablas, las políticas RLS y las vistas
  index.ts                los dos clientes: dbAdmin y comoUsuario()
  queries.ts              todo el acceso a datos
  migrations/             versionadas desde el día uno
  pruebas/                los 37 casos, en local y contra Supabase
lib/
  supabase/               client (navegador), server (cookies)
  sesion.ts               perfilActual() y exigirPerfil()
  tmdb.ts                 el cliente de TMDB, solo servidor
styles/temas.css          los temas como variables CSS
proxy.ts                  refresco de sesión y guardia de rutas
db/demo.ts                el Postgres de juguete de `npm run demo`
lib/demo.ts               el interruptor del modo demo
```

Esto es Next 16: lo que en las guías viejas es `middleware.ts` acá se llama
`proxy.ts`, con la función exportada como `proxy`. El renombre es de Next, no
una decisión nuestra, y hay mucho tutorial desactualizado dando vueltas.

### Los temas

Siete, y no son modos oscuros: cada uno cambia fondo, tipografía, radios, acento,
textura y hasta los colores con que se distingue a cada persona.

| | Papel y washi | Bullet journal | Menta granizada |
| --- | --- | --- | --- |
| Fondo | beige con renglones | blanco con grilla de puntos | menta con chips de cacao |
| Acento | terracota | violeta | verde profundo |
| Texto | Lora | Quicksand | Quicksand |
| Radio | 0,75 rem | 1 rem | 0,875 rem |

Y cuatro de hadas, uno por cada imagen de inspiración de Ceci:

| | Jardín de hadas | Pradera de luz | Acuarela y estrellas | Guarida del dragón |
| --- | --- | --- | --- | --- |
| Fondo | pergamino salvia con destellos dorados | verde luminoso con bokeh | papel con grano y estrellas amarillas | crema durazno, estrellas y luna |
| Acento | lavanda | rosa | verde salvia | orquídea |
| Texto | Lora | Figtree | Lora | Lora |
| Radio | 1,125 rem | 1,25 rem | 0,875 rem | 0,75 rem |

Se guardan en `perfiles.tema`, no en el navegador, así cada uno tiene el suyo en
cualquier dispositivo. El `data-tema` lo escribe el layout del servidor en el
primer render: aplicarlo con JavaScript después de montar haría ver un flash del
tema equivocado.

Para agregar otro hay que tocar cuatro lugares, y el orden importa porque
el primero es el que manda:

1. `db/schema.ts` — sumarlo al check `perfiles_tema_valido` y generar la
   migración. La base es la que decide qué temas existen.
2. `styles/temas.css` — el bloque `[data-tema='...']` con todos los tokens.
3. `app/acciones.ts` — la constante `TEMAS`, que valida lo que llega del form.
4. `app/(libreta)/ajustes/FormularioAjustes.tsx` — la opción y sus tres muestras
   de color, la única excepción a «ningún componente escribe un hex a mano».

Y el `COLOR_DE_FONDO` de `app/layout.tsx`, para la barra del navegador.

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

## Qué falta

- Correr las migraciones contra Supabase de verdad y pasar
  `npm run db:test:supabase`.
- Notificaciones push: iOS ya las soporta en PWAs agregadas al inicio. Con un
  trigger de Postgres, «Ceci puntuó Perfect Days» es lo primero que agregaría.
- Un service worker que cachee el shell y los pósters.
