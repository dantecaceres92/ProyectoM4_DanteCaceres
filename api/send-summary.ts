/**
 * Vercel Function: POST /api/send-summary
 *
 * Intermediario seguro entre el frontend y AWS SES.
 * - Las credenciales de AWS SOLO existen acá (variables de entorno del servidor).
 * - Verifica el ID token de Firebase: solo usuarios logueados pueden enviar,
 *   y el email se envía únicamente al email del propio usuario (no a cualquier dirección).
 *
 * Archivo único a propósito: Vercel compila cada función por separado y los imports
 * relativos en ESM suelen romperse en runtime.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface SummaryTask {
  title: string;
  description?: string;
  completed: boolean;
}

const MAX_TASKS = 200;

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Valida el body que manda el cliente (nunca confiar en el frontend) */
export function parseTasks(body: unknown): SummaryTask[] | null {
  if (typeof body !== 'object' || body === null) return null;
  const tasks = (body as { tasks?: unknown }).tasks;
  if (!Array.isArray(tasks) || tasks.length > MAX_TASKS) return null;

  const valid = tasks.every(
    (t) =>
      typeof t === 'object' &&
      t !== null &&
      typeof t.title === 'string' &&
      typeof t.completed === 'boolean',
  );
  return valid ? (tasks as SummaryTask[]) : null;
}

export function buildSummary(tasks: SummaryTask[]): { subject: string; html: string; text: string } {
  const completed = tasks.filter((t) => t.completed);
  const pending = tasks.filter((t) => !t.completed);
  const subject = `Resumen de tareas: ${completed.length}/${tasks.length} completadas`;

  const list = (items: SummaryTask[]) =>
    items.length === 0
      ? '<p><em>Ninguna</em></p>'
      : `<ul>${items
          .map(
            (t) =>
              `<li><strong>${escapeHtml(t.title)}</strong>${
                t.description ? ` — ${escapeHtml(t.description)}` : ''
              }</li>`,
          )
          .join('')}</ul>`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2>📋 Resumen de tus tareas</h2>
      <p>Total: <b>${tasks.length}</b> · Completadas: <b>${completed.length}</b> · Pendientes: <b>${pending.length}</b></p>
      <h3>⏳ Pendientes</h3>${list(pending)}
      <h3>✅ Completadas</h3>${list(completed)}
    </div>`;

  const text = [
    `Resumen de tareas (${completed.length}/${tasks.length} completadas)`,
    '',
    'PENDIENTES:',
    ...(pending.length ? pending.map((t) => `- ${t.title}`) : ['- Ninguna']),
    '',
    'COMPLETADAS:',
    ...(completed.length ? completed.map((t) => `- ${t.title}`) : ['- Ninguna']),
  ].join('\n');

  return { subject, html, text };
}

/** Verifica el ID token de Firebase con la API REST de Identity Toolkit y devuelve el email */
async function verifyFirebaseToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('Falta FIREBASE_API_KEY en el servidor');

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { users?: { email?: string }[] };
  return data.users?.[0]?.email ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const authHeader = req.headers.authorization ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'No autorizado' });

  const tasks = parseTasks(req.body);
  if (!tasks) return res.status(400).json({ error: 'Datos de tareas inválidos' });

  const { AWS_SES_REGION, AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, SES_FROM_EMAIL } =
    process.env;
  if (!AWS_SES_REGION || !AWS_SES_ACCESS_KEY_ID || !AWS_SES_SECRET_ACCESS_KEY || !SES_FROM_EMAIL) {
    return res.status(500).json({ error: 'El servidor no tiene configurado el envío de emails' });
  }

  try {
    const userEmail = await verifyFirebaseToken(idToken);
    if (!userEmail) return res.status(401).json({ error: 'Sesión inválida o expirada' });

    const { subject, html, text } = buildSummary(tasks);
    const ses = new SESClient({
      region: AWS_SES_REGION,
      credentials: {
        accessKeyId: AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
      },
    });

    await ses.send(
      new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: { ToAddresses: [userEmail] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: text, Charset: 'UTF-8' },
          },
        },
      }),
    );

    return res.status(200).json({ message: 'Email enviado', sentTo: userEmail });
  } catch (error) {
    console.error('[send-summary]', error);
    const name = (error as { name?: string }).name;
    if (name === 'MessageRejected') {
      return res.status(400).json({
        error: 'AWS SES rechazó el email (en modo sandbox el destinatario debe estar verificado).',
      });
    }
    return res.status(500).json({ error: 'No se pudo enviar el email' });
  }
}
