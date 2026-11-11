ALTER TABLE "mimos" ADD COLUMN "tipo" text DEFAULT 'tambien' NOT NULL;--> statement-breakpoint
CREATE INDEX "mimos_espacio_idx" ON "mimos" USING btree ("espacio_id","creado_en" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "mimos" ADD CONSTRAINT "mimos_tipo_valido" CHECK ("mimos"."tipo" in ('tambien', 'mas'));