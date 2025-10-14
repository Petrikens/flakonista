<script setup>
defineProps({
  section: Object,
})
</script>

<template>
  <div>
    <p :id="`${section.name}-heading`" class="font-medium text-gray-900">
      {{ section.name }}
    </p>
    <ul :aria-labelledby="`${section.name}-heading`" class="mt-6 space-y-6 sm:mt-4 sm:space-y-4">
      <li v-for="item in section.items" :key="item.name" class="flex">
        <a :href="item.href" class="hover:text-gray-800">{{ item.name }}</a>
      </li>
    </ul>
  </div>
</template>
