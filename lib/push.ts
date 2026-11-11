import 'server-only';
import webpush from 'web-push';
import { olvidarEndpoint, suscripcionesDe } from '@/db/queries';

/**
 * Las claves VAPID identifican a la app ante los servicios de push (Apple,
 * Google, Mozilla). Se generan una vez con `npx web-push generate-vapid-keys`.
 * Sin ellas no se manda nada, y la app sigue andando igual.
 */
const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privada = process.env.VAPID_PRIVATE_KEY;
const contacto = process.env.VAPID_SUBJECT ?? 'mailto:libreta@example.com';

let configurado = false;
function configurar() {
  if (configurado) return true;
  if (!publica || !privada) return false;
  webpush.setVapidDetails(contacto, publica, privada);
  configurado = true;
  return true;
}

export type Aviso = { titulo: string; cuerpo?: string; url?: string };

/**
 * A todos los celulares de esa persona. Nunca tira: un aviso que no llega no
 * puede romper lo que lo disparó.
 */
export async function avisar(perfilId: string, aviso: Aviso) {
  if (!configurar()) return;
  try {
    const subs = await suscripcionesDe(perfilId);
    const payload = JSON.stringify({ title: aviso.titulo, body: aviso.cuerpo, url: aviso.url ?? '/' });
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 60 * 60 * 24, urgency: 'high' },
          );
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await olvidarEndpoint(s.endpoint);
          else console.error('push falló', status ?? e);
        }
      }),
    );
  } catch (e) {
    console.error('push falló', e);
  }
}
