<template>
  <form class="hidden lg:block" @submit.prevent>
    <h3 class="sr-only">Фильтры</h3>
    <Disclosure
      v-for="section in filters"
      :key="section.id"
      as="div"
      class="border-b border-gray-200 py-6"
      v-slot="{ open: isOpen }"
    >
      <h3 class="-my-3 flow-root">
        <DisclosureButton
          class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          :aria-controls="`panel-${section.id}`"
          :aria-expanded="isOpen"
        >
          <span class="font-medium text-gray-900 flex items-center gap-2">
            {{ section.name }}
            <!-- бейдж количества выбранных -->
            <span
              v-if="selectedCount(section) > 0"
              class="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700"
              aria-hidden="true"
            >
              {{ selectedCount(section) }}
            </span>
          </span>
          <span class="ml-6 flex items-center">
            <PlusIcon v-if="!isOpen" class="size-5" aria-hidden="true" />
            <MinusIcon v-else class="size-5" aria-hidden="true" />
          </span>
        </DisclosureButton>
      </h3>

      <DisclosurePanel :id="`panel-${section.id}`" class="pt-4">
        <fieldset class="space-y-4">
          <legend class="sr-only">{{ section.name }}</legend>

          <div
            v-for="(option, optionIdx) in section.options"
            :key="option.value"
            class="flex items-center gap-3"
          >
            <div class="flex h-5 shrink-0 items-center">
              <div class="group grid size-4 grid-cols-1">
                <input
                  :id="`filter-${section.id}-${optionIdx}`"
                  :name="sectionName(section.id)"
                  :value="option.value"
                  type="checkbox"
                  :checked="option.checked"
                  :aria-checked="option.checked"
                  class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                  @change="onChange(section.id, option.value, $event)"
                />
                <!-- чек/индетерминейт визуал -->
                <svg
                  class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    class="opacity-0 group-has-checked:opacity-100"
                    d="M3 8L6 11L11 3.5"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    class="opacity-0 group-has-indeterminate:opacity-100"
                    d="M3 7H11"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <label :for="`filter-${section.id}-${optionIdx}`" class="text-sm text-gray-700 flex-1">
              {{ option.label }}
            </label>
          </div>
        </fieldset>
      </DisclosurePanel>
    </Disclosure>
  </form>
</template>

<script setup lang="ts">
import type { FilterSection } from '~/types/catalog'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { MinusIcon, PlusIcon } from '@heroicons/vue/20/solid'

defineProps<{
  filters: FilterSection[]
}>()

const emit = defineEmits<{
  (e: 'toggle', payload: { sectionId: string; value: string; checked: boolean }): void
}>()

function sectionName(sectionId: string) {
  // корректная группировка radio
  return sectionId === 'seasons' ? 'season' : `${sectionId}[]`
}

function onChange(sectionId: string, value: string, ev: Event) {
  const checked = (ev.target as HTMLInputElement).checked
  emit('toggle', { sectionId, value, checked })
}

function selectedCount(section: FilterSection) {
  return section.options.reduce((n, o) => n + (o.checked ? 1 : 0), 0)
}
</script>
