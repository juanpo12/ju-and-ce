-- Series además de películas. TMDB numera las dos cosas por separado, así que
-- el tmdb_id solo ya no identifica una ficha: la clave pasa a ser (tmdb_id, tipo).
--
-- Las vistas se tiran y se vuelven a crear: v_entradas_puntuadas agrupa por la
-- PK de peliculas (por eso puede elegir sus columnas sin agregarlas al group
-- by), así que depende de esa PK y no deja cambiarla. Además `e.*` se expande
-- al crear la vista: sin recrearla, `tipo` no aparecería.
DROP VIEW "public"."v_por_genero";--> statement-breakpoint
DROP VIEW "public"."v_entradas_puntuadas";--> statement-breakpoint

ALTER TABLE "entradas" DROP CONSTRAINT "entradas_espacio_tmdb_uq";--> statement-breakpoint
ALTER TABLE "entradas" DROP CONSTRAINT "entradas_tmdb_id_peliculas_tmdb_id_fk";--> statement-breakpoint
ALTER TABLE "peliculas" DROP CONSTRAINT "peliculas_pkey";--> statement-breakpoint

ALTER TABLE "peliculas" ADD COLUMN "tipo" text DEFAULT 'pelicula' NOT NULL;--> statement-breakpoint
ALTER TABLE "entradas" ADD COLUMN "tipo" text DEFAULT 'pelicula' NOT NULL;--> statement-breakpoint
ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_tmdb_id_tipo_pk" PRIMARY KEY("tmdb_id","tipo");--> statement-breakpoint
ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_tipo_valido" CHECK ("peliculas"."tipo" in ('pelicula', 'serie'));--> statement-breakpoint
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_ficha_fk" FOREIGN KEY ("tmdb_id","tipo") REFERENCES "public"."peliculas"("tmdb_id","tipo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_espacio_tmdb_uq" UNIQUE("espacio_id","tmdb_id","tipo");--> statement-breakpoint

-- Iguales a las de 0001, con el join por la clave nueva.
create view public.v_entradas_puntuadas
with (security_invoker = on) as
select e.*,
       p.titulo,
       p.anio,
       p.duracion_min,
       p.generos,
       p.poster_path,
       avg(pt.estrellas)      as promedio,
       count(pt.perfil_id)    as cuantos_puntuaron
from public.entradas e
join public.peliculas p on p.tmdb_id = e.tmdb_id and p.tipo = e.tipo
left join public.puntajes pt on pt.entrada_id = e.id
group by e.id, p.tmdb_id, p.tipo;
--> statement-breakpoint

create view public.v_por_genero
with (security_invoker = on) as
select e.espacio_id,
       g as genero,
       count(*) as cantidad
from public.entradas e
join public.peliculas p on p.tmdb_id = e.tmdb_id and p.tipo = e.tipo
cross join lateral unnest(p.generos) as g
where e.estado = 'vista'
group by e.espacio_id, g;
--> statement-breakpoint

grant select on public.v_entradas_puntuadas to authenticated;
--> statement-breakpoint
grant select on public.v_por_genero to authenticated;
