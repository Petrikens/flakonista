<template>
  <PopoverGroup class="hidden lg:ml-8 lg:block lg:self-stretch">
    <div class="flex h-full space-x-8">
      <!-- <NavCategory
        v-for="category in navigation.categories"
        :key="category.name"
        :category="category"
      /> -->
      <a
        v-for="page in navigation.pages"
        :key="page.name"
        :href="page.href"
        class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
        >{{ page.name }}</a
      >
    </div>
  </PopoverGroup>
</template>

<script setup>
import { PopoverGroup } from '@headlessui/vue'
// import NavCategory from './NavCategory.vue'
defineProps({
  navigation: Object,
})
</script>
