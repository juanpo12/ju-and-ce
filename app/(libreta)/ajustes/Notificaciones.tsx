'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Boton } from '@/components/Boton';
import { accionBorrarSuscripcion, accionGuardarSuscripcion } from '@/app/acciones';

const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Estado = 'cargando' | 'sin-configurar' | 'sin-soporte' | 'iphone-sin-instalar' | 'bloqueadas' | 'apagadas' | 'prendidas';

function aBytes(base64: string) {
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
  const crudo = atob((base64 + relleno).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(crudo, (c) => c.charCodeAt(0));
}

const registrar = () =>
  navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });

/**
 * Cada celular se activa por separado: el permiso es del navegador, no de la
 * cuenta. En iPhone solo anda con la app agregada al inicio (iOS 16.4 o más).
 */
export function Notificaciones() {
  const [estado, setEstado] = useState<Estado>('cargando');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    (async () => {
      if (!CLAVE_PUBLICA) return setEstado('sin-configurar');
      const soporta = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      if (!soporta) {
        const esIphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const instalada = window.matchMedia('(display-mode: standalone)').matches;
        setEstado(esIphone && !instalada ? 'iphone-sin-instalar' : 'sin-soporte');
        return;
      }
      if (Notification.permission === 'denied') return setEstado('bloqueadas');
      const reg = await registrar();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Por las dudas, que el servidor la tenga (y a nombre de quien está ahora).
        void guardar(sub);
        setEstado('prendidas');
      } else setEstado('apagadas');
    })().catch(() => setEstado('sin-soporte'));
  }, []);

  async function guardar(sub: PushSubscription) {
    const json = sub.toJSON();
    await accionGuardarSuscripcion({
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    });
  }

  async function prender() {
    setOcupado(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        setEstado(permiso === 'denied' ? 'bloqueadas' : 'apagadas');
        return;
      }
      await registrar();
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: aBytes(CLAVE_PUBLICA!),
        }));
      await guardar(sub);
      setEstado('prendidas');
      toast('Listo, te van a llegar los avisos 💛');
    } catch {
      toast.error('No se pudieron activar, probá de nuevo');
    } finally {
      setOcupado(false);
    }
  }

  async function apagar() {
    setOcupado(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await accionBorrarSuscripcion(sub.endpoint);
        await sub.unsubscribe();
      }
      setEstado('apagadas');
    } finally {
      setOcupado(false);
    }
  }

  const textos: Record<Estado, string> = {
    cargando: 'Fijándome…',
    'sin-configurar': 'Todavía no están configuradas en el servidor (faltan las claves VAPID).',
    'sin-soporte': 'Este navegador no puede recibir notificaciones.',
    'iphone-sin-instalar':
      'En iPhone primero hay que agregarla al inicio (Safari → Compartir → «Agregar a inicio») y abrirla desde ese ícono.',
    bloqueadas:
      'Están bloqueadas para esta página. Se desbloquean desde los ajustes del celular o del navegador.',
    apagadas: 'Te avisa en este celular cuando te mandan un te amo, aunque la app esté cerrada.',
    prendidas: 'Activadas en este celular: te avisa cuando te mandan un te amo.',
  };

  return (
    <>
      <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{textos[estado]}</p>
      {estado === 'apagadas' && (
        <Boton className="mt-3 w-full" onClick={prender} disabled={ocupado}>
          {ocupado ? 'Activando…' : 'Activar notificaciones 🔔'}
        </Boton>
      )}
      {estado === 'prendidas' && (
        <Boton variante="suave" className="mt-3 w-full" onClick={apagar} disabled={ocupado}>
          Desactivar en este celular
        </Boton>
      )}
    </>
  );
}
