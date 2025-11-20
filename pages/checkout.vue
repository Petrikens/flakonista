<script setup lang="ts">
import { z } from 'zod'
import { getMinPrice, formatPrice, generateProductAlt, CONSTANTS } from '~/utils/constants'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  CreditCardIcon,
  ShoppingBagIcon,
} from '@heroicons/vue/24/outline'

const config = useRuntimeConfig()
const route = useRoute()
const baseUrl = config.public.siteUrl || 'https://flakonista.by'
const canonicalUrl = `${baseUrl}/checkout`

// SEO мета-теги для страницы оформления заказа (noindex)
useSeoMeta({
  title: 'Оформление заказа',
  description: 'Оформление заказа парфюмерии с доставкой по Беларуси',
  robots: 'noindex, nofollow',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})

interface OrderResponse {
  ok: boolean
  orderId?: string
  orderNumber?: string
  error?: string
  previewUrl?: string | null
}

// =============================================
// Инициализация
// =============================================

const cart = useCartStore()
const ui = useUiStore()
const router = useRouter()

// Guard: redirect if empty cart or not coming from cart action
if (process.client) {
  if (cart.items.length === 0 || !ui.allowCheckout) {
    router.replace('/')
  } else {
    // consume the one-shot flag so direct refresh won't pass again
    ui.consumeCheckoutAccess()
  }
}

// =============================================
// Расчеты
// =============================================

const subtotal = computed(() =>
  cart.items.reduce(
    (sum, i) => sum + ((i.variant?.price ?? getMinPrice(i.product)) || 0) * i.qty,
    0
  )
)

// Доставка бесплатная при заказе от 3000 руб
const shipping = computed(() => {
  if (subtotal.value >= 3000) return 0
  if (subtotal.value > 0) return 5
  return 0
})

const total = computed(() => subtotal.value + shipping.value)

// =============================================
// Валидация формы
// =============================================

const schema = z.object({
  firstName: z.string().min(2, 'Введите имя'),
  lastName: z.string().min(2, 'Введите фамилию'),
  phone: z
    .string()
    .min(10, 'Введите телефон')
    .regex(/^[+\d][\d\s()-]{9,}$/u, 'Некорректный номер'),
  email: z.string().email('Некорректный email'),
  contactMethod: z.enum(['telegram', 'viber', 'email', 'call']),
  city: z.string().min(2, 'Укажите город'),
  street: z.string().min(2, 'Укажите улицу'),
  house: z.string().min(1, 'Укажите дом'),
  apartment: z.string().optional(),
  postalCode: z
    .string()
    .min(4, 'Укажите индекс')
    .regex(/^\d{4,10}$/u, 'Некорректный индекс'),
  notes: z.string().optional(), // ✅ ДОБАВЛЕНО
})

type FormData = z.infer<typeof schema>

// =============================================
// Состояние формы
// =============================================

const form = reactive<FormData>({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  contactMethod: 'telegram',
  city: '',
  street: '',
  house: '',
  apartment: '',
  postalCode: '',
  notes: '', // ✅ ДОБАВЛЕНО
})

const errors = reactive<Partial<Record<keyof FormData, string>>>({})
const submitting = ref(false)
const showSuccess = ref(false)
const confirmSubmit = ref(false)
const submitError = ref<string | null>(null)
const orderNumber = ref<string | null>(null) // ✅ ИЗМЕНЕНО: orderNumber вместо orderId

// =============================================
// Функции
// =============================================

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete (errors as any)[k])
  const res = schema.safeParse(form)
  if (!res.success) {
    for (const issue of res.error.issues) {
      const key = issue.path[0] as keyof FormData
      if (!errors[key]) errors[key] = issue.message
    }
    return false
  }
  return true
}

function validateField(field: keyof FormData) {
  const fieldSchema = schema.pick({ [field]: true })
  const res = fieldSchema.safeParse({ [field]: form[field] })
  if (!res.success) {
    errors[field] = res.error.issues[0]?.message
  } else {
    delete errors[field]
  }
}

async function submit() {
  if (!validate()) {
    // Скроллим к первой ошибке
    const firstError = document.querySelector('.text-red-600')
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    // ✅ ОБНОВЛЕНО: Расширенный payload
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      contactMethod: form.contactMethod,
      city: form.city,
      street: form.street,
      house: form.house,
      apartment: form.apartment || undefined,
      postalCode: form.postalCode,
      notes: form.notes || undefined,
      items: cart.items.map((i) => ({
        id: i.id,
        productId: i.product.id, // ✅ ДОБАВЛЕНО
        name: i.product.name,
        image: i.product.image_path, // ✅ ДОБАВЛЕНО
        variantId: i.variant?.id, // ✅ ДОБАВЛЕНО
        variantLabel: i.variant?.label, // ✅ ДОБАВЛЕНО
        qty: i.qty,
        price: (i.variant?.price ?? getMinPrice(i.product)) || 0,
      })),
      subtotal: subtotal.value,
      shipping: shipping.value, // ✅ ДОБАВЛЕНО
      total: total.value,
    }

    const res = await $fetch<OrderResponse>('/api/orders', {
      method: 'POST',
      body: payload,
    })

    console.log(res)

    if (res.ok && res.orderNumber) {
      orderNumber.value = res.orderNumber // ✅ ИСПОЛЬЗУЕМ orderNumber
      cart.clear()
      showSuccess.value = true
      submitError.value = null

      // Логируем preview URL для dev
      if (res.previewUrl) {
        console.info('[Checkout] Email preview:', res.previewUrl)
      }
    } else {
      throw new Error(res.error || 'Неизвестная ошибка')
    }
  } catch (error: any) {
    console.error('[Checkout] Submit error:', error)
    submitError.value =
      error.data?.statusMessage || error.message || 'Произошла ошибка при оформлении заказа'
  } finally {
    submitting.value = false
    confirmSubmit.value = false
  }
}

// =============================================
// Хелперы для отображения
// =============================================

function getContactMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    telegram: 'Telegram',
    viber: 'Viber',
    email: 'Email',
    call: 'Звонок',
  }
  return labels[method] || method
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <div class="flex max-lg:flex-col gap-8 max-w-7xl mx-auto">
      <!-- ✅ УЛУЧШЕНО: Order summary sidebar -->
      <div class="lg:w-[420px] bg-gray-50 lg:min-h-screen lg:sticky lg:top-0">
        <div class="p-6 lg:p-8">
          <!-- Заголовок -->
          <div class="flex items-center gap-2 mb-6">
            <ShoppingBagIcon class="h-6 w-6 text-gray-700" />
            <h2 class="text-lg font-semibold text-gray-900">Ваш заказ</h2>
            <span
              class="ml-auto bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {{ cart.items.length }} {{ cart.items.length === 1 ? 'товар' : 'товаров' }}
            </span>
          </div>

          <!-- Товары -->
          <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            <div
              v-for="item in cart.items"
              :key="`${item.id}:${item.variantId ?? 'base'}`"
              class="bg-white rounded-lg p-4 shadow-sm"
            >
              <div class="flex gap-4">
                <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    :src="item.product.image_path[0] || CONSTANTS.PRODUCT_IMAGE_PLACEHOLDER"
                    :alt="
                      generateProductAlt(
                        item.product.name,
                        item.product.brand?.name || item.product.brands?.name
                      )
                    "
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {{ item.product.name }}
                  </h3>
                  <!-- ✅ ДОБАВЛЕНО: Показываем вариант -->
                  <p v-if="item.variant?.label" class="text-xs text-gray-500 mt-1">
                    Объем: {{ item.variant.label }}
                  </p>
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      {{ item.qty }} ×
                      {{ formatPrice(item.variant?.price ?? getMinPrice(item.product)) }}
                    </span>
                    <span class="text-sm font-medium text-gray-900">
                      {{
                        formatPrice(
                          ((item.variant?.price ?? getMinPrice(item.product)) || 0) * item.qty
                        )
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Итоги -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Подытог</span>
                <span class="font-medium text-gray-900">{{ formatPrice(subtotal) }}</span>
              </div>

              <!-- ✅ УЛУЧШЕНО: Информативная доставка -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 flex items-center gap-1">
                  <TruckIcon class="h-4 w-4" />
                  Доставка
                </span>
                <span
                  class="font-medium"
                  :class="shipping === 0 ? 'text-green-600' : 'text-gray-900'"
                >
                  {{ shipping === 0 ? 'Бесплатно' : formatPrice(shipping) }}
                </span>
              </div>

              <!-- Подсказка про бесплатную доставку -->
              <div
                v-if="shipping > 0 && subtotal < 3000"
                class="text-xs text-gray-500 bg-blue-50 p-2 rounded"
              >
                До бесплатной доставки: {{ formatPrice(50 - subtotal) }}
              </div>

              <div class="pt-3 border-t border-gray-200">
                <div class="flex justify-between">
                  <span class="text-base font-semibold text-gray-900">Итого</span>
                  <span class="text-xl font-bold text-indigo-600">{{ formatPrice(total) }}</span>
                </div>
              </div>
            </div>

            <!-- ✅ УЛУЧШЕНО: Кнопка с состояниями -->
            <button
              type="button"
              class="mt-6 w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                submitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              "
              :disabled="cart.items.length === 0 || submitting"
              @click="confirmSubmit = true"
            >
              <span v-if="!submitting" class="flex items-center justify-center gap-2">
                <CreditCardIcon class="h-5 w-5" />
                Оформить заказ
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Обработка...
              </span>
            </button>

            <!-- Ошибка -->
            <div v-if="submitError" class="mt-3 p-3 bg-red-50 rounded-lg">
              <p class="text-sm text-red-600 flex items-start gap-2">
                <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0" />
                {{ submitError }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ УЛУЧШЕНО: Form section -->
      <div class="flex-1 p-6 lg:p-8">
        <form @submit.prevent="submit" class="max-w-2xl">
          <!-- Заголовок формы -->
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Оформление заказа</h1>
            <p class="mt-2 text-sm text-gray-600">
              Заполните форму, и мы свяжемся с вами для подтверждения заказа
            </p>
          </div>

          <!-- Контактная информация -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span
                class="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold"
              >
                1
              </span>
              Контактная информация
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Имя <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.firstName"
                  type="text"
                  placeholder="Иван"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.firstName ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('firstName')"
                />
                <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">
                  {{ errors.firstName }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.lastName"
                  type="text"
                  placeholder="Иванов"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.lastName ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('lastName')"
                />
                <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">
                  {{ errors.lastName }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="ivan@example.com"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.email ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('email')"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">
                  {{ errors.email }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Телефон <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+375XXXXXXXX"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.phone ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('phone')"
                />
                <p v-if="errors.phone" class="mt-1 text-xs text-red-600">
                  {{ errors.phone }}
                </p>
              </div>

              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Удобный способ связи <span class="text-red-500">*</span>
                </label>
                <div class="flex flex-wrap gap-3">
                  <label
                    v-for="method in ['telegram', 'viber', 'email', 'call']"
                    :key="method"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors"
                    :class="
                      form.contactMethod === method
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    "
                  >
                    <input
                      type="radio"
                      :value="method"
                      v-model="form.contactMethod"
                      class="sr-only"
                    />
                    <span class="text-sm font-medium">{{ getContactMethodLabel(method) }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Адрес доставки -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span
                class="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold"
              >
                2
              </span>
              Адрес доставки
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Город <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="Минск"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.city ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('city')"
                />
                <p v-if="errors.city" class="mt-1 text-xs text-red-600">
                  {{ errors.city }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Почтовый индекс <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.postalCode"
                  type="text"
                  placeholder="123456"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.postalCode ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('postalCode')"
                />
                <p v-if="errors.postalCode" class="mt-1 text-xs text-red-600">
                  {{ errors.postalCode }}
                </p>
              </div>

              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Улица <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.street"
                  type="text"
                  placeholder="ул. Ленина"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.street ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('street')"
                />
                <p v-if="errors.street" class="mt-1 text-xs text-red-600">
                  {{ errors.street }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Дом <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.house"
                  type="text"
                  placeholder="10"
                  class="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  :class="errors.house ? 'border-red-300' : 'border-gray-300'"
                  @blur="validateField('house')"
                />
                <p v-if="errors.house" class="mt-1 text-xs text-red-600">
                  {{ errors.house }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Квартира / Офис
                </label>
                <input
                  v-model="form.apartment"
                  type="text"
                  placeholder="15 (необязательно)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- ✅ ДОБАВЛЕНО: Комментарий к заказу -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span
                class="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold"
              >
                3
              </span>
              Дополнительная информация
            </h2>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Комментарий к заказу
              </label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Например: позвоните за час до доставки"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ✅ УЛУЧШЕНО: Success modal -->
    <TransitionRoot as="template" :show="showSuccess">
      <Dialog class="relative z-50" @close="showSuccess = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div class="text-center">
                <CheckCircleIcon class="mx-auto h-12 w-12 text-green-500" />
                <DialogTitle class="mt-4 text-lg font-semibold text-gray-900">
                  Заказ успешно оформлен!
                </DialogTitle>

                <div
                  v-if="orderNumber"
                  class="mt-3 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <span class="text-sm text-gray-600">Номер заказа:</span>
                  <span class="text-base font-bold text-gray-900">{{ orderNumber }}</span>
                </div>

                <p class="mt-4 text-sm text-gray-600">
                  Мы отправили подтверждение на <strong>{{ form.email }}</strong
                  >. Наш менеджер свяжется с вами в ближайшее время для уточнения деталей доставки.
                </p>

                <div class="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    @click="(showSuccess = false), router.replace('/catalog')"
                  >
                    Продолжить покупки
                  </button>
                  <button
                    class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
                    @click="(showSuccess = false), router.replace('/')"
                  >
                    На главную
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- ✅ УЛУЧШЕНО: Confirm modal -->
    <TransitionRoot as="template" :show="confirmSubmit">
      <Dialog class="relative z-50" @close="confirmSubmit = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <DialogTitle class="text-lg font-semibold text-gray-900">
                Подтверждение заказа
              </DialogTitle>

              <div class="mt-4 space-y-2">
                <p class="text-sm text-gray-600">Пожалуйста, проверьте данные:</p>

                <div class="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Имя:</span>
                    <span class="font-medium">{{ form.firstName }} {{ form.lastName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Телефон:</span>
                    <span class="font-medium">{{ form.phone }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium">{{ form.email }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Сумма заказа:</span>
                    <span class="font-bold text-indigo-600">{{ formatPrice(total) }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex gap-3">
                <button
                  class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="confirmSubmit = false"
                >
                  Отмена
                </button>
                <button
                  class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  :disabled="submitting"
                  @click="submit"
                >
                  <span v-if="!submitting">Подтвердить</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg
                      class="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Отправка...
                  </span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
