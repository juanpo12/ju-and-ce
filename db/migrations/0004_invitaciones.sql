CREATE TABLE "invitaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"espacio_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"creada_por" uuid NOT NULL,
	"vence_en" timestamp with time zone NOT NULL,
	"usada_en" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitaciones_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "invitaciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_espacio_id_espacios_id_fk" FOREIGN KEY ("espacio_id") REFERENCES "public"."espacios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_creada_por_perfiles_id_fk" FOREIGN KEY ("creada_por") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;