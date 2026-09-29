import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    // Migraciones por la conexion directa (5432), no por el pooler:
    // drizzle-kit necesita una sesion propia para el lock de migracion.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
  // Supabase ya trae anon / authenticated / service_role: que drizzle-kit no
  // intente crearlos ni borrarlos.
  entities: {
    roles: { provider: 'supabase' },
  },
  // La app vive solo en `public`. Sin esto, drizzle-kit ve auth/storage/realtime
  // y propone borrarlas.
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
});
