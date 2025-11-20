<template>
  <footer class="bg-white rounded-lg shadow-sm dark:bg-gray-900">
    <div class="w-full mx-auto p-4 md:py-8">
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
  { href: '/catalog', label: 'Каталог' },
  { href: '/catalog/men', label: 'Мужчинам' },
  { href: '/catalog/women', label: 'Женщинам' },
  { href: '/#about', label: 'О нас' },
  { href: '/#shiping', label: 'Доставка' },
  { href: '/#contact', label: 'Связаться с нами' },
]
</script>
