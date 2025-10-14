<script setup>
defineProps({
  item: Object,
})
</script>

<template>
  <div class="group relative text-base sm:text-sm">
    <img
      :src="item.imageSrc"
      :alt="item.imageAlt"
      class="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
    />
    <a :href="item.href" class="mt-6 block font-medium text-gray-900">
      <span class="absolute inset-0 z-10" aria-hidden="true" />
      {{ item.name }}
    </a>
    <p aria-hidden="true" class="mt-1">Shop now</p>
  </div>
</template>
