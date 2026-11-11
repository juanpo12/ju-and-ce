CREATE TABLE "mimos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"espacio_id" uuid NOT NULL,
	"de" uuid NOT NULL,
	"para" uuid NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"visto_en" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mimos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mimos" ADD CONSTRAINT "mimos_espacio_id_espacios_id_fk" FOREIGN KEY ("espacio_id") REFERENCES "public"."espacios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mimos" ADD CONSTRAINT "mimos_de_perfiles_id_fk" FOREIGN KEY ("de") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mimos" ADD CONSTRAINT "mimos_para_perfiles_id_fk" FOREIGN KEY ("para") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mimos_para_idx" ON "mimos" USING btree ("para") WHERE "mimos"."visto_en" is null;--> statement-breakpoint
CREATE POLICY "mimos_lectura" ON "mimos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (espacio_id = public.mi_espacio());--> statement-breakpoint
CREATE POLICY "mimos_envio" ON "mimos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (de = (select auth.uid()) and espacio_id = public.mi_espacio() and exists (
      select 1 from public.perfiles p
      where p.id = para and p.espacio_id = public.mi_espacio()
    ));--> statement-breakpoint
CREATE POLICY "mimos_visto" ON "mimos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (para = (select auth.uid())) WITH CHECK (para = (select auth.uid()) and espacio_id = public.mi_espacio());--> statement-breakpoint

-- El mimo llega en vivo por Realtime: la tabla tiene que estar en la
-- publicación. Guardado porque en PGlite (pruebas, demo) no existe.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.mimos;
  end if;
end $$;
