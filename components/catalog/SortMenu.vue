<template>
  <Menu as="div" class="relative inline-block text-left">
    <MenuButton
      class="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Сортировать
      <ChevronDownIcon
        class="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
    </MenuButton>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 z-100 mt-2 w-48 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none"
      >
        <div class="py-1">
          <MenuItem v-for="option in options" :key="option.name" v-slot="{ active }">
            <button
              type="button"
              role="menuitemradio"
              :aria-checked="modelValue?.name === option.name"
              class="flex w-full items-center gap-2 px-4 py-2 text-sm"
              :class="[
                modelValue?.name === option.name ? 'font-medium text-gray-900' : 'text-gray-600',
                active ? 'bg-gray-100' : '',
              ]"
              @click="emit('update:modelValue', option)"
            >
              <svg
                v-if="modelValue?.name === option.name"
                class="size-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-7.023 7.023a1 1 0 01-1.414 0L3.293 8.757a1 1 0 111.414-1.414l3.151 3.151 6.316-6.316a1 1 0 011.533.115z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ option.name }}
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import type { SortOption } from '~/types/catalog'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'

defineProps<{
  options: SortOption[]
  modelValue?: SortOption
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: SortOption): void
}>()
</script>
