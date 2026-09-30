/**
 * La fecha de hoy como 'YYYY-MM-DD', en el calendario de una zona horaria.
 *
 * No `toISOString()`: eso da la fecha en UTC, y en Argentina a partir de las 21
 * ya es mañana — la peli que vieron a la noche quedaba anotada al día siguiente.
 *
 * Sin zona, la del que ejecuta: en el navegador, la del celular. En el servidor
 * (que en Vercel corre en UTC) hay que pasarla.
 */
export function hoyISO(zona?: string) {
  // en-CA formatea como año-mes-día, que es justo lo que espera un <input type="date">.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** La de la libreta: la usan dos personas en Argentina. */
export const ZONA_LIBRETA = 'America/Argentina/Buenos_Aires';
