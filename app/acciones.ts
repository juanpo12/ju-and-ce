'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { crearClienteServidor } from '@/lib/supabase/server';
import { clienteAdmin } from '@/lib/supabase/admin';
import { traerFicha } from '@/lib/tmdb';
import { esDemo } from '@/lib/demo';
import {
  borrarEntrada,
  borrarPuntaje,
  crearEntrada,
  crearInvitacion,
  editarEntrada,
  guardarAjustes,
  guardarFicha,
  guardarPuntaje,
  invitacionValida,
  liberarInvitacion,
  marcarComoVista,
  reservarInvitacion,
  sumarAlEspacio,
} from '@/db/queries';

/**
 * Las mutaciones. Todas pasan por `exigirPerfil()` y de ahí a `comoUsuario()`,
 * así que atraviesan la RLS igual que si vinieran del navegador: el id del
 * usuario sale de la sesión, nunca del formulario.
 */

/** Los mismos tres que acepta el check de `perfiles.tema` en la base. */
const TEMAS = ['papel', 'bullet', 'menta'];

function refrescar(...rutas: string[]) {
  for (const r of ['/', '/pendientes', '/resumen', ...rutas]) revalidatePath(r);
}

export async function accionPuntuar(
  entradaId: string,
  estrellas: number,
  comentario: string | null,
) {
  const perfil = await exigirPerfil();
  if (!(estrellas >= 0.5 && estrellas <= 5)) throw new Error('Puntaje fuera de rango');

  await guardarPuntaje(perfil.id, entradaId, estrellas, comentario?.trim() || null);
  refrescar(`/peli/${entradaId}`);
}

export async function accionBorrarPuntaje(entradaId: string) {
  const perfil = await exigirPerfil();
  await borrarPuntaje(perfil.id, entradaId);
  refrescar(`/peli/${entradaId}`);
}

export async function accionAgregar(datos: {
  tmdbId: number;
  estado: 'vista' | 'pendiente';
  vistaEl?: string | null;
  lugar?: string | null;
}) {
  const perfil = await exigirPerfil();

  // La ficha tiene que existir antes que la entrada: `entradas.tmdb_id` la
  // referencia. Esto ya corre en el servidor, así que va derecho a TMDB — pasar
  // por /api/peliculas sería un request HTTP de la app a sí misma.
  await guardarFicha(await traerFicha(datos.tmdbId));

  const id = await crearEntrada(perfil.id, perfil.espacioId, datos);
  refrescar();
  return id;
}

export async function accionMarcarVista(entradaId: string, formData?: FormData) {
  const perfil = await exigirPerfil();
  await marcarComoVista(perfil.id, entradaId, {
    vistaEl: (formData?.get('vista_el') as string) || null,
    lugar: (formData?.get('lugar') as string) || null,
  });
  refrescar(`/peli/${entradaId}`);
}

export async function accionEditarEntrada(entradaId: string, formData: FormData) {
  const perfil = await exigirPerfil();
  await editarEntrada(perfil.id, entradaId, {
    vistaEl: (formData.get('vista_el') as string) || null,
    lugar: (formData.get('lugar') as string) || null,
  });
  refrescar(`/peli/${entradaId}`);
}

export async function accionBorrarEntrada(entradaId: string) {
  const perfil = await exigirPerfil();
  await borrarEntrada(perfil.id, entradaId);
  refrescar();
  redirect('/');
}

export async function accionGuardarAjustes(formData: FormData) {
  const perfil = await exigirPerfil();
  const nombre = (formData.get('nombre') as string)?.trim();
  const tema = formData.get('tema') as string;

  await guardarAjustes(perfil.id, {
    ...(nombre ? { nombre } : {}),
    ...(TEMAS.includes(tema) ? { tema } : {}),
  });
  // El tema vive en el <html> del layout raíz, así que hay que revalidar todo.
  revalidatePath('/', 'layout');
}

/**
 * El link para que la otra persona se sume. Se manda una sola vez: con eso crea
 * su cuenta y queda adentro. Si la libreta ya tiene a los dos, no hay link.
 */
export async function accionInvitar(): Promise<string> {
  const perfil = await exigirPerfil();
  if (perfil.companero) throw new Error('La libreta ya tiene a los dos');

  const token = await crearInvitacion(perfil.id, perfil.espacioId);
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const protocolo = h.get('x-forwarded-proto') ?? 'https';
  return `${protocolo}://${host}/unirse/${token}`;
}

/**
 * El canje: crea la cuenta con la clave secreta (el registro público está
 * apagado, así que es la única puerta), la suma al espacio y deja la sesión
 * abierta. Si algo falla a mitad de camino, deshace lo hecho y el link sigue
 * sirviendo.
 */
export async function accionUnirse(
  token: string,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const mail = String(formData.get('mail') ?? '').trim().toLowerCase();
  const clave = String(formData.get('clave') ?? '');

  if (!nombre) return { error: 'Falta tu nombre.' };
  if (!mail.includes('@')) return { error: 'Ese mail no parece válido.' };
  if (clave.length < 8) return { error: 'La contraseña tiene que tener al menos 8 caracteres.' };

  const invitacion = await invitacionValida(token);
  if (!invitacion || !(await reservarInvitacion(invitacion.id))) {
    return { error: 'Esta invitación ya se usó o venció. Pedí una nueva.' };
  }

  const admin = clienteAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email: mail,
    password: clave,
    email_confirm: true,
  });
  if (error || !data.user) {
    await liberarInvitacion(invitacion.id);
    return {
      error: /already|registered|exists/i.test(error?.message ?? '')
        ? 'Ya hay una cuenta con ese mail.'
        : 'No pudimos crear la cuenta. Probá de nuevo.',
    };
  }

  try {
    await sumarAlEspacio(data.user.id, invitacion.espacioId, nombre);
  } catch (e) {
    console.error('[unirse] no se pudo crear el perfil', e);
    await admin.auth.admin.deleteUser(data.user.id);
    await liberarInvitacion(invitacion.id);
    return { error: 'No pudimos sumarte a la libreta. Probá de nuevo.' };
  }

  const supabase = await crearClienteServidor();
  await supabase.auth.signInWithPassword({ email: mail, password: clave });
  redirect('/');
}

export async function accionSalir() {
  if (esDemo) return;

  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect('/entrar');
}
