// server/api/orders.post.ts

import nodemailer from 'nodemailer'
import { eventHandler, readBody, createError, getHeader, type H3Event } from 'h3'
import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'

const OrderItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  productId: z.string().optional(), // UUID товара
  name: z.string().min(1),
  variantId: z.string().optional(), // ID варианта (2ml, 5ml и т.д.)
  variantLabel: z.string().optional(), // Название варианта
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
})

const OrderSchema = z.object({
  firstName: z.string().min(2, 'Имя слишком короткое'),
  lastName: z.string().min(2, 'Фамилия слишком короткая'),
  phone: z
    .string()
    .min(10, 'Некорректный телефон')
    .regex(/^[+\d][\d\s()-]{9,}$/u, 'Некорректный формат телефона'),
  email: z.string().email('Некорректный email'),
  contactMethod: z.enum(['telegram', 'viber', 'email', 'call']),
  city: z.string().min(2, 'Укажите город'),
  street: z.string().min(2, 'Укажите улицу'),
  house: z.string().min(1, 'Укажите номер дома'),
  apartment: z.string().optional(),
  postalCode: z
    .string()
    .min(4, 'Некорректный индекс')
    .regex(/^\d{4,10}$/u, 'Индекс должен содержать только цифры'),
  items: z.array(OrderItemSchema).min(1, 'Корзина пуста'),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().positive(),
  notes: z.string().optional(),
})

type OrderPayload = z.infer<typeof OrderSchema>
type OrderItemPayload = z.infer<typeof OrderItemSchema>

interface OrderResponse {
  ok: boolean
  orderId?: string
  orderNumber?: string
  error?: string
  previewUrl?: string | null
}

interface DbOrder {
  id: string
  order_number: string
  status: string
  created_at: string
}

interface DbOrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  variant_id: string | null
  variant_label: string | null
  price: number
  quantity: number
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT_MAX = 5
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

function generateAdminEmailHtml(order: OrderPayload, orderNumber: string): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${item.name}
          ${item.variantLabel ? `<br><small style="color: #666;">${item.variantLabel}</small>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.qty}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ${item.price.toFixed(2)} BYN
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ${(item.qty * item.price).toFixed(2)} BYN
        </td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .order-number { color: #007bff; font-size: 24px; font-weight: bold; }
        .section { margin: 20px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #495057; }
        table { width: 100%; border-collapse: collapse; }
        .total-row { font-weight: bold; font-size: 18px; }
        .info-row { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🆕 Новый заказ</h2>
          <div class="order-number">${orderNumber}</div>
        </div>
        
        <div class="section">
          <div class="section-title">👤 Информация о клиенте</div>
          <div class="info-row"><strong>Имя:</strong> ${order.firstName} ${order.lastName}</div>
          <div class="info-row"><strong>Телефон:</strong> ${order.phone}</div>
          <div class="info-row"><strong>Email:</strong> ${order.email}</div>
          <div class="info-row"><strong>Способ связи:</strong> ${order.contactMethod}</div>
        </div>
        
        <div class="section">
          <div class="section-title">📍 Адрес доставки</div>
          <div class="info-row">
            ${order.city}, ${order.street} ${order.house}${order.apartment ? `, кв. ${order.apartment}` : ''}<br>
            Индекс: ${order.postalCode}
          </div>
        </div>
        
        ${
          order.notes
            ? `
          <div class="section">
            <div class="section-title">📝 Комментарий к заказу</div>
            <div class="info-row">${order.notes}</div>
          </div>
        `
            : ''
        }
        
        <div class="section">
          <div class="section-title">🛒 Товары</div>
          <table>
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 8px; text-align: left;">Товар</th>
                <th style="padding: 8px; text-align: center;">Кол-во</th>
                <th style="padding: 8px; text-align: right;">Цена</th>
                <th style="padding: 8px; text-align: right;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right;">Подытог:</td>
                <td style="padding: 8px; text-align: right;">${order.subtotal.toFixed(2)} BYN</td>
              </tr>
              ${
                order.shipping > 0
                  ? `
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;">Доставка:</td>
                  <td style="padding: 8px; text-align: right;">${order.shipping.toFixed(2)} BYN</td>
                </tr>
              `
                  : ''
              }
              <tr class="total-row" style="background: #f8f9fa;">
                <td colspan="3" style="padding: 12px; text-align: right;">ИТОГО:</td>
                <td style="padding: 12px; text-align: right; color: #28a745;">
                  ${order.total.toFixed(2)} BYN
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateClientEmailHtml(order: OrderPayload, orderNumber: string): string {
  const itemsList = order.items
    .map(
      (item) => `
      <li>
        ${item.name} 
        ${item.variantLabel ? `(${item.variantLabel})` : ''} 
        — ${item.qty} шт. × ${item.price.toFixed(2)} BYN
      </li>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .order-badge { display: inline-block; background: white; color: #667eea; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .section { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Спасибо за заказ!</h1>
          <div class="order-badge">${orderNumber}</div>
        </div>
        
        <p>Здравствуйте, ${order.firstName}!</p>
        
        <p>Мы получили ваш заказ и уже начали его обработку. Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей доставки.</p>
        
        <div class="section">
          <h3>Детали заказа:</h3>
          <ul>${itemsList}</ul>
          <p><strong>Итого к оплате: ${order.total.toFixed(2)} BYN</strong></p>
        </div>
        
        <div class="section">
          <h3>Адрес доставки:</h3>
          <p>
            ${order.city}, ${order.street} ${order.house}${order.apartment ? `, кв. ${order.apartment}` : ''}<br>
            Индекс: ${order.postalCode}
          </p>
        </div>
        
        <div class="section">
          <h3>Контактная информация:</h3>
          <p>
            Телефон: ${order.phone}<br>
            Email: ${order.email}<br>
            Предпочтительный способ связи: ${order.contactMethod}
          </p>
        </div>
        
        <p>
          Если у вас есть вопросы, пожалуйста, свяжитесь с нами любым удобным способом.
        </p>
        
        <p>
          С уважением,<br>
          Команда Flakonista
        </p>
      </div>
    </body>
    </html>
  `
}

export default eventHandler(async (event: H3Event): Promise<OrderResponse> => {
  try {
    const ip =
      getHeader(event, 'x-forwarded-for') || event.node.req.socket?.remoteAddress || 'unknown'
    checkRateLimit(ip)

    const body = await readBody(event)
    const parsed = OrderSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Некорректные данные заказа',
        data: parsed.error.flatten(),
      })
    }

    const orderData = parsed.data

    const supabase = await serverSupabaseClient(event)

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        status: 'new',
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        phone: orderData.phone,
        email: orderData.email,
        contact_method: orderData.contactMethod,
        city: orderData.city,
        street: orderData.street,
        house: orderData.house,
        apartment: orderData.apartment || null,
        postal_code: orderData.postalCode,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        total: orderData.total,
        notes: orderData.notes || null,
      })
      .select('id, order_number, status, created_at')
      .single()

    if (orderError || !newOrder) {
      console.error('[orders] Failed to create order:', orderError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Не удалось создать заказ. Попробуйте позже.',
      })
    }

    const orderItems = orderData.items.map((item) => ({
      order_id: newOrder.id,
      product_id: typeof item.productId === 'string' ? item.productId : null,
      product_name: item.name,
      variant_id: item.variantId || null,
      variant_label: item.variantLabel || null,
      price: item.price,
      quantity: item.qty,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('[orders] Failed to create order items:', itemsError)
    }

    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // false для порта 587
      auth: { user, pass },
    })

    const adminEmail = process.env.ORDER_ADMIN_EMAIL // p1p2v3s4@gmail.com
    const fromEmail = process.env.MAIL_FROM // 19antonpetrov96@gmail.com

    try {
      // ✅ Письмо 1: Администратору
      const adminMail = await transporter.sendMail({
        from: `"Flakonista Shop" <${fromEmail}>`, // От: 19antonpetrov96@gmail.com
        to: adminEmail, // Кому: p1p2v3s4@gmail.com
        subject: `📦 Новый заказ ${newOrder.order_number}`,
        html: generateAdminEmailHtml(orderData, newOrder.order_number),
      })

      console.log('[orders] Admin email sent:', adminMail.messageId)
    } catch (emailError) {
      console.error('[orders] Failed to send admin email:', emailError)
    }

    // 8. Отправка email клиенту
    try {
      // ✅ Письмо 2: Клиенту
      const clientMail = await transporter.sendMail({
        from: `"Flakonista Shop" <${fromEmail}>`, // От: 19antonpetrov96@gmail.com
        to: orderData.email, // Кому: email клиента из формы
        subject: `✅ Ваш заказ ${newOrder.order_number} принят`,
        html: generateClientEmailHtml(orderData, newOrder.order_number),
      })

      console.log('[orders] Client email sent to:', orderData.email)
    } catch (emailError) {
      console.error('[orders] Failed to send client email:', emailError)
    }

    console.info('[orders] Order created successfully', {
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
      email: orderData.email,
      total: orderData.total,
      itemsCount: orderData.items.length,
    })

    // 10. Возвращаем успешный ответ
    return {
      ok: true,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    }
  } catch (error: any) {
    // Обработка ошибок
    console.error('[orders] Error processing order:', error)

    // Если это уже createError, пробрасываем
    if (error.statusCode) {
      throw error
    }

    // Иначе возвращаем общую ошибку
    throw createError({
      statusCode: 500,
      statusMessage: 'Произошла ошибка при обработке заказа',
    })
  }
})
