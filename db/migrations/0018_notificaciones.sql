CREATE TABLE "suscripciones_push" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perfil_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suscripciones_push_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "suscripciones_push" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "suscripciones_push" ADD CONSTRAINT "suscripciones_push_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "suscripciones_push_perfil_idx" ON "suscripciones_push" USING btree ("perfil_id");--> statement-breakpoint
CREATE POLICY "suscripciones_push_propias" ON "suscripciones_push" AS PERMISSIVE FOR ALL TO "authenticated" USING (perfil_id = (select auth.uid())) WITH CHECK (perfil_id = (select auth.uid()));