<template>
  <div class="bg-gray-100">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
        <h2 class="text-2xl font-bold text-gray-900">Категории</h2>

        <div class="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-6">
          <div v-for="callout in callouts" :key="callout.name" class="group relative">
            <img
              :src="callout.imageSrc"
              :alt="callout.imageAlt"
              class="w-full rounded-lg bg-white max-sm:object-contain object-cover max-sm:aspect-[4/3] sm:aspect-[2/1] lg:aspect-square group-hover:opacity-75"
            />
            <h3 class="mt-6 text-sm text-primary">
              <a :href="callout.href">
                <span class="absolute inset-0" />
                {{ callout.name }}
              </a>
            </h3>
            <p class="text-base font-semibold text-gray-900">{{ callout.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const callouts = [
  {
    name: 'Мужчинам',
    description: 'Выделяйтесь без лишних слов',
    imageSrc: '/images/categories/men.jpeg',
    imageAlt: 'Black 9pm Afnan perfume bottle with matching box for men',
    href: '/catalog/men',
  },
  {
    name: 'Женщинам',
    description: 'За вашим шлейфом будут следовать',
    imageSrc: '/images/categories/women.jpeg',
    imageAlt: 'Red Saga perfume bottle nestled in a satin gift box for women',
    href: '/catalog/women',
  },
  {
    name: 'Подарочные наборы и аромабоксы',
    description: 'Лучшие ароматы уже собраны здесь',
    imageSrc: '/images/categories/aromaboxes.jpeg',
    imageAlt: 'Black gift box with orange ribbon beside three amber aroma vials',
    href: '/catalog/aromaboxes',
  },
]
</script>
