'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirPerfil } from '@/lib/sesion';
import { crearClienteServidor } from '@/lib/supabase/server';
import { traerFicha } from '@/lib/tmdb';
import { esDemo } from '@/lib/demo';
import {
  borrarEntrada,
  borrarPuntaje,
  crearEntrada,
  editarEntrada,
  guardarAjustes,
  guardarFicha,
  guardarPuntaje,
  marcarComoVista,
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

export async function accionSalir() {
  if (esDemo) return;

  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect('/entrar');
}
