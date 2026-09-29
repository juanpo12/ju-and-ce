ALTER TABLE "entradas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "espacios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "peliculas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "perfiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "puntajes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "entradas_rw" ON "entradas" AS PERMISSIVE FOR ALL TO "authenticated" USING (espacio_id = public.mi_espacio()) WITH CHECK (espacio_id = public.mi_espacio());--> statement-breakpoint
CREATE POLICY "espacios_lectura" ON "espacios" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id = public.mi_espacio());--> statement-breakpoint
CREATE POLICY "peliculas_lectura" ON "peliculas" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "perfiles_lectura" ON "perfiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (espacio_id = public.mi_espacio());--> statement-breakpoint
CREATE POLICY "perfiles_propio" ON "perfiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()) and espacio_id = public.mi_espacio());--> statement-breakpoint
CREATE POLICY "puntajes_lectura" ON "puntajes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
      select 1 from public.entradas e
      where e.id = entrada_id and e.espacio_id = public.mi_espacio()
    ));--> statement-breakpoint
CREATE POLICY "puntajes_escritura" ON "puntajes" AS PERMISSIVE FOR ALL TO "authenticated" USING (perfil_id = (select auth.uid())) WITH CHECK (perfil_id = (select auth.uid()) and exists (
      select 1 from public.entradas e
      where e.id = entrada_id and e.espacio_id = public.mi_espacio()
    ));