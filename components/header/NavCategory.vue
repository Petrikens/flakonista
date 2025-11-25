<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import NavCategoryFeatured from './NavCategoryFeatured.vue'
import NavCategorySection from './NavCategorySection.vue'

defineProps({
  category: Object,
})
</script>

<template>
  <Popover class="flex" v-slot="{ open }">
    <div class="relative flex">
      <PopoverButton
        :class="[
          open ? 'text-primary' : 'text-gray-700 hover:text-gray-800',
          'relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-out',
        ]"
      >
        {{ category.name }}
        <span
          :class="[
            open ? 'bg-primary' : '',
            'absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out',
          ]"
        />
      </PopoverButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <PopoverPanel class="absolute inset-x-0 top-full z-20 w-full bg-white text-sm text-gray-500">
        <div class="absolute inset-0 top-1/2 bg-white shadow-sm" aria-hidden="true" />
        <div class="relative bg-white">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
              <div class="col-start-2 grid grid-cols-2 gap-x-8">
                <NavCategoryFeatured
                  v-for="item in category.featured"
                  :key="item.name"
                  :item="item"
                />
              </div>

              <div class="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                <NavCategorySection
                  v-for="section in category.sections"
                  :key="section.name"
                  :section="section"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>
