<template>
  <div id="about" class="bg-white">
    <div
      class="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8"
    >
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          А почему, собственно, <span class="text-primary">мы?</span>
        </h2>
        <p class="mt-4 text-gray-500">
          Магазин «Флакониста» — это выражение нашей любви к парфюмерии. Обладая большим опытом и
          знаниями, мы решили исследовать мир восточных ароматов, и результат нас по-настоящему
          впечатлил.
        </p>

        <dl class="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
          <div
            v-for="(feature, index) in features"
            :key="feature.name"
            class="border-t border-gray-200 pt-4"
          >
            <dt class="font-medium text-gray-900" :class="{ 'text-primary': index % 2 === 0 }">
              {{ feature.name }}
            </dt>
            <dd class="mt-2 text-sm text-gray-500">{{ feature.description }}</dd>
          </div>
        </dl>
      </div>
      <div class="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
        <img
          src="/images/choose/choose1.jpeg"
          alt="Two gold zodiac perfume bottles labeled Capricorn and Virgo with silk cloth"
          class="rounded-lg bg-gray-100"
        />
        <img
          src="/images/choose/choose2.jpeg"
          alt="Lattafa Khamrah perfume in a clear cut-glass bottle on a white plinth"
          class="rounded-lg bg-gray-100"
        />
        <img
          src="/images/choose/choose3.jpeg"
          alt="Flat lay of three ornate gold perfume bottles including Grecia and crystal flacon"
          class="rounded-lg bg-gray-100"
        />
        <img
          src="/images/choose/choose4.jpeg"
          alt="Gift boxes with orange ribbons and set of three travel perfume vials"
          class="rounded-lg bg-gray-100"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const features = [
  {
    name: '100% Оригинальная продукция',
    description:
      'Мы работаем только с проверенными поставщиками и гарантируем оригинальность каждого флакона.',
  },
  {
    name: 'Парфюмеры с мировым именем',
    description:
      'Лучшее подтверждение качества — авторы композиций. Над ароматами наших брендов работали ведущие мастера индустрии, включая Квентина Биша (создателя хитов Fleur Narcotique, Ganymede и Delina).',
  },
  {
    name: 'Попробуйте все и сразу',
    description:
      'Мы предлагаем небольшие объемы (3 – 15 мл) для знакомства с ароматом. Это лучший способ протестировать парфюм перед покупкой полного флакона. Также мы поможем собрать ваш «ольфакторный гардероб» на любой случай.',
  },
  {
    name: 'Подарите нас',
    description:
      'На сайте представлены готовые решения — тематические наборы в стильной упаковке. Хотите чего-то особенного? Опишите свои пожелания, и мы соберем индивидуальный набор специально для вас, красиво упакуем и отправим получателю.',
  },
  {
    name: 'Качество и эстетика',
    description:
      'Стойкость и шлейф не уступают дорогим аналогам. А упаковка и презентация — это отдельный вид искусства.',
  },
  {
    name: 'Доверьтесь нашему опыту',
    description:
      'Мы изучили сотни дорогих ароматов, чтобы со знанием дела помочь вам сэкономить. Напишите нам название привычного парфюма или опишите любимые ноты — мы подберем для вас лучший вариант из восточной коллекции.',
  },
]
</script>
