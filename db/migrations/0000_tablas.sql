CREATE TABLE "entradas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"espacio_id" uuid NOT NULL,
	"tmdb_id" integer NOT NULL,
	"estado" text NOT NULL,
	"vista_el" date,
	"lugar" text,
	"agregada_por" uuid NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entradas_espacio_tmdb_uq" UNIQUE("espacio_id","tmdb_id"),
	CONSTRAINT "entradas_estado_valido" CHECK ("entradas"."estado" in ('vista', 'pendiente'))
);
--> statement-breakpoint
ALTER TABLE "entradas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "espacios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "espacios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "peliculas" (
	"tmdb_id" integer PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"titulo_original" text,
	"anio" smallint,
	"duracion_min" smallint,
	"director" text,
	"generos" text[] DEFAULT '{}' NOT NULL,
	"poster_path" text,
	"sinopsis" text,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "peliculas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "perfiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"espacio_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"color" text DEFAULT 'terracota' NOT NULL,
	"tema" text DEFAULT 'papel' NOT NULL,
	CONSTRAINT "perfiles_tema_valido" CHECK ("perfiles"."tema" in ('papel', 'bullet'))
);
--> statement-breakpoint
ALTER TABLE "perfiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "puntajes" (
	"entrada_id" uuid NOT NULL,
	"perfil_id" uuid NOT NULL,
	"estrellas" numeric(2, 1) NOT NULL,
	"comentario" text,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "puntajes_entrada_id_perfil_id_pk" PRIMARY KEY("entrada_id","perfil_id"),
	CONSTRAINT "puntajes_estrellas_validas" CHECK ("puntajes"."estrellas" between 0.5 and 5)
);
--> statement-breakpoint
ALTER TABLE "puntajes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_espacio_id_espacios_id_fk" FOREIGN KEY ("espacio_id") REFERENCES "public"."espacios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_tmdb_id_peliculas_tmdb_id_fk" FOREIGN KEY ("tmdb_id") REFERENCES "public"."peliculas"("tmdb_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_agregada_por_perfiles_id_fk" FOREIGN KEY ("agregada_por") REFERENCES "public"."perfiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_espacio_id_espacios_id_fk" FOREIGN KEY ("espacio_id") REFERENCES "public"."espacios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntajes" ADD CONSTRAINT "puntajes_entrada_id_entradas_id_fk" FOREIGN KEY ("entrada_id") REFERENCES "public"."entradas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntajes" ADD CONSTRAINT "puntajes_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entradas_espacio_estado_idx" ON "entradas" USING btree ("espacio_id","estado","creada_en" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "perfiles_espacio_idx" ON "perfiles" USING btree ("espacio_id");--> statement-breakpoint
CREATE INDEX "puntajes_perfil_idx" ON "puntajes" USING btree ("perfil_id");