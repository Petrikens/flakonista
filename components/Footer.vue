<template>
  <footer class="bg-white rounded-lg shadow-sm dark:bg-gray-900">
    <div class="w-full mx-auto p-4 md:py-8 space-y-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <NuxtLink to="/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
          <img src="../public/images/logo.png" class="h-8" alt="Logo" />
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
            >Флакониста</span
          >
        </NuxtLink>
        <ul
          class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400"
        >
          <li v-for="link in footerLinks" :key="link.href">
            <NuxtLink
              v-if="link.href.startsWith('/')"
              :to="link.href"
              class="hover:underline me-4 md:me-6"
            >
              {{ link.label }}
            </NuxtLink>
            <a v-else :href="link.href" class="hover:underline me-4 md:me-6">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
      <div
        class="grid gap-8 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-2 lg:grid-cols-3"
      >
        <section class="space-y-3">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Информация</h3>
          <ul class="space-y-2">
            <li v-for="item in companyInfo" :key="item">
              {{ item }}
            </li>
          </ul>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ registryNote }}
          </p>
        </section>
        <section class="space-y-3">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Присоединяйтесь</h3>
          <ul class="space-y-2">
            <li v-for="social in socialLinks" :key="social.href">
              <a
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-gray-900 hover:underline dark:hover:text-white"
              >
                {{ social.label }}
              </a>
            </li>
          </ul>
        </section>
        <section class="space-y-3 md:col-span-2 lg:col-span-1">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Наши контакты</h3>
          <ul class="space-y-2">
            <li v-for="contact in contactLinks" :key="contact.href">
              <a
                :href="contact.href"
                class="block hover:text-gray-900 hover:underline dark:hover:text-white"
              >
                {{ contact.label }}: {{ contact.value }}
              </a>
            </li>
          </ul>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Режим работы:<br />
            {{ supportHours }}
          </p>
        </section>
      </div>
      <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400"
        >© 2025 <a href="/" class="hover:underline">Флакониста</a>. Все права защищены.</span
      >
    </div>
  </footer>
</template>

<script setup lang="ts">
interface FooterLink {
  href: string
  label: string
}

const footerLinks: FooterLink[] = [
  { href: '/offer', label: 'Договор оферты' },
  { href: '/privacy', label: 'Политика конфиденциальности' },
]

const companyInfo = [
  'ООО «Дом флакона»',
  'УНП 692275803',
  'Адрес: 222302, Минская область, г. Молодечно, ул. Великий Гостинец, д. 143, индекс Р, корпус 2, офис 24',
  'В торговом реестре с …',
  'ОАО «АСБ Беларусбанк»',
  'BY11AKBB30120000336180000000 BYN',
]

const registryNote =
  'Общество с ограниченной ответственностью «Дом флакона» зарегистрировано 01.08.2025 г. Молодечненским районным исполнительным комитетом с регистрационным номером 692275803.'

const socialLinks: FooterLink[] = [
  { href: 'https://www.instagram.com/flakonista', label: 'Instagram' },
  { href: 'https://t.me/flakonista', label: 'Telegram' },
  { href: 'https://www.tiktok.com/@flakinista?_r=1&_t=ZM-923iqXqllO4', label: 'TikTok' },
]

interface ContactLink {
  href: string
  label: string
  value: string
}

const contactLinks: ContactLink[] = [
  {
    href: 'mailto:flakonista.order@gmail.com',
    label: 'Email',
    value: 'flakonista.order@gmail.com',
  },
  { href: 'https://t.me/flakonista', label: 'Telegram', value: 't.me/flakonista' },
  { href: 'tel:+375298955014', label: 'Телефон', value: '+375 (29) 895-50-14' },
]

const supportHours =
  'Заявки принимаются круглосуточно. Контакт-центр работает с понедельника по пятницу с 9:00–21:00, в субботу с 10:00–18:00, воскресенье — выходной.'
</script>
