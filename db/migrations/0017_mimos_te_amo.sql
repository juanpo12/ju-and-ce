ALTER TABLE "mimos" DROP CONSTRAINT "mimos_tipo_valido";--> statement-breakpoint
ALTER TABLE "mimos" ADD CONSTRAINT "mimos_tipo_valido" CHECK ("mimos"."tipo" in ('te_amo', 'tambien', 'mas'));