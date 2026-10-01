CREATE TABLE "noches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"espacio_id" uuid NOT NULL,
	"modo" text NOT NULL,
	"fase" text NOT NULL,
	"juego" text,
	"creada_por" uuid NOT NULL,
	"ganador_id" uuid,
	"entrada_id" uuid,
	"estado" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secreto" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"terminada_en" timestamp with time zone,
	CONSTRAINT "noches_modo_valido" CHECK ("noches"."modo" in ('individual', 'duo')),
	CONSTRAINT "noches_fase_valida" CHECK ("noches"."fase" in ('esperando', 'candidatas', 'juego', 'jugando', 'terminada', 'cancelada')),
	CONSTRAINT "noches_juego_valido" CHECK ("noches"."juego" is null or "noches"."juego" in ('ppt', 'memoria', 'ahorcado', 'wordle', 'moneda'))
);
--> statement-breakpoint
ALTER TABLE "noches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "entradas" ADD COLUMN "elegida_en" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "noches" ADD CONSTRAINT "noches_espacio_id_espacios_id_fk" FOREIGN KEY ("espacio_id") REFERENCES "public"."espacios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noches" ADD CONSTRAINT "noches_creada_por_perfiles_id_fk" FOREIGN KEY ("creada_por") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noches" ADD CONSTRAINT "noches_ganador_id_perfiles_id_fk" FOREIGN KEY ("ganador_id") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noches" ADD CONSTRAINT "noches_entrada_id_entradas_id_fk" FOREIGN KEY ("entrada_id") REFERENCES "public"."entradas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "noches_activa_uq" ON "noches" USING btree ("espacio_id") WHERE "noches"."fase" not in ('terminada', 'cancelada');--> statement-breakpoint
CREATE INDEX "noches_historial_idx" ON "noches" USING btree ("espacio_id","terminada_en" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "entradas_elegida_uq" ON "entradas" USING btree ("espacio_id") WHERE "entradas"."elegida_en" is not null;--> statement-breakpoint
CREATE POLICY "noches_rw" ON "noches" AS PERMISSIVE FOR ALL TO "authenticated" USING (espacio_id = public.mi_espacio()) WITH CHECK (espacio_id = public.mi_espacio());--> statement-breakpoint

-- `e.*` se expande al crear la vista (ver 0007): sin recrearla, `elegida_en`
-- no aparecería en v_entradas_puntuadas. Misma definición que 0007.
DROP VIEW "public"."v_entradas_puntuadas";--> statement-breakpoint

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

grant select on public.v_entradas_puntuadas to authenticated;
--> statement-breakpoint

-- Los dos celulares siguen la sesión por Realtime: la tabla tiene que estar en
-- la publicación. Guardado porque en el Postgres de las pruebas (PGlite) no
-- existe. En Supabase conviene verificarlo en Database → Publications.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.noches;
  end if;
end $$;
