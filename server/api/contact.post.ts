import nodemailer from 'nodemailer'
import { eventHandler, readBody, createError, getHeader } from 'h3'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2, 'Имя слишком короткое'),
  phone: z
    .string()
    .min(10, 'Некорректный телефон')
    .regex(/^[+\d][\d\s()-]{9,}$/u, 'Некорректный формат телефона'),
  email: z.string().email('Некорректный email'),
  message: z
    .string()
    .trim()
    .min(1, 'Сообщение слишком короткое')
    .max(2000, 'Сообщение слишком длинное'),
})

type ContactPayload = z.infer<typeof ContactSchema>

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_LOOKUP[char] || char)
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT_MAX = 10
const ipHits = new Map<string, { count: number; start: number }>()

function checkRateLimit(ip: string): void {
  const now = Date.now()
  const entry = ipHits.get(ip)

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    ipHits.set(ip, { count: 1, start: now })
  } else {
    entry.count += 1
    if (entry.count > RATE_LIMIT_MAX) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Слишком много запросов. Попробуйте позже.',
      })
    }
  }
}

function buildContactEmailHtml(payload: ContactPayload) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #111827; line-height: 1.6; }
          .container { max-width: 560px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px; }
          .header { margin-bottom: 24px; }
          .header h1 { margin: 0; font-size: 22px; color: #1f2937; }
          .section { background: #ffffff; padding: 16px 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); }
          .row { margin-bottom: 12px; }
          .label { font-size: 13px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.08em; }
          .value { font-size: 16px; color: #111827; font-weight: 600; }
          .message { white-space: pre-wrap; font-weight: 500; color: #1f2937; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 Новое сообщение с формы обратной связи</h1>
          </div>
          <div class="section">
            <div class="row">
              <div class="label">Имя</div>
              <div class="value">${escapeHtml(payload.name)}</div>
            </div>
            <div class="row">
              <div class="label">Телефон</div>
              <div class="value">${escapeHtml(payload.phone)}</div>
            </div>
            <div class="row">
              <div class="label">Email</div>
              <div class="value">${escapeHtml(payload.email)}</div>
            </div>
            <div class="row">
              <div class="label">Сообщение</div>
              <div class="message">${escapeHtml(payload.message).replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export default eventHandler(async (event) => {
  const ip =
    getHeader(event, 'x-forwarded-for') || event.node.req.socket?.remoteAddress || 'unknown'
  checkRateLimit(ip)

  const body = await readBody(event)
  const parsed = ContactSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некорректные данные формы',
      data: parsed.error.flatten(),
    })
  }

  const payload = parsed.data

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const fromEmail = process.env.MAIL_FROM
  const adminEmail = process.env.ORDER_ADMIN_EMAIL

  if (!host || !user || !pass || !fromEmail || !adminEmail) {
    console.error('[contact] Missing SMTP configuration')
    throw createError({
      statusCode: 500,
      statusMessage: 'Сервис отправки писем не настроен',
    })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  try {
    const result = await transporter.sendMail({
      from: `"Flakonista Site" <${fromEmail}>`,
      to: adminEmail,
      replyTo: `"${payload.name}" <${payload.email}>`,
      subject: '📨 Новое сообщение с сайта',
      html: buildContactEmailHtml(payload),
    })

    console.info('[contact] Message sent', {
      messageId: result.messageId,
      from: payload.email,
    })
  } catch (error) {
    console.error('[contact] Failed to send email', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Не удалось отправить сообщение. Попробуйте позже.',
    })
  }

  return { ok: true }
})
