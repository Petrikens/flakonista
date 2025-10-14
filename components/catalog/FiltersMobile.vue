<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-40 lg:hidden" @close="emit('update:open', false)">
      <!-- backdrop -->
      <TransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 z-40 flex">
        <!-- panel -->
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <DialogPanel
            class="relative ml-auto flex size-full max-w-xs flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl"
          >
            <!-- header -->
            <div class="flex items-center justify-between px-4">
              <h2 class="text-lg font-medium text-gray-900">Фильтры</h2>
              <button
                type="button"
                class="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                @click="emit('update:open', false)"
              >
                <span class="sr-only">Закрыть меню фильтров</span>
                <XMarkIcon class="size-6" aria-hidden="true" />
              </button>
            </div>

            <!-- sections -->
            <form class="mt-4 border-t border-gray-200" @submit.prevent>
              <Disclosure
                v-for="section in filters"
                :key="section.id"
                as="div"
                class="border-t border-gray-200 px-4 py-6"
                v-slot="{ open: isOpen }"
              >
                <h3 class="-mx-2 -my-3 flow-root">
                  <DisclosureButton
                    class="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
                    :aria-controls="`panel-${section.id}`"
                    :aria-expanded="isOpen"
                  >
                    <span class="font-medium text-gray-900 flex items-center gap-2">
                      {{ section.name }}
                      <!-- badge с количеством выбранных -->
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
                            :id="`filter-mobile-${section.id}-${optionIdx}`"
                            :name="sectionName(section.id)"
                            :value="option.value"
                            :type="inputType(section.id)"
                            class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                            :checked="option.checked"
                            @change="
                              onToggle(
                                section.id,
                                String(option.value),
                                ($event.target as HTMLInputElement).checked
                              )
                            "
                            :aria-checked="option.checked"
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

                      <label
                        :for="`filter-mobile-${section.id}-${optionIdx}`"
                        class="min-w-0 flex-1 text-gray-700"
                      >
                        {{ option.label }}
                      </label>
                    </div>
                  </fieldset>
                </DisclosurePanel>
              </Disclosure>
            </form>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import type { FilterSection } from '~/types/catalog'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { MinusIcon, PlusIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{
  open: boolean
  filters: FilterSection[]
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'toggle', payload: { sectionId: string; value: string; checked: boolean }): void
}>()

function onToggle(sectionId: string, value: string, checked: boolean) {
  emit('toggle', { sectionId, value, checked })
}

// checkbox для мультивыбора, radio для одиночного (seasons)
function inputType(sectionId: string) {
  return sectionId === 'seasons' ? 'radio' : 'checkbox'
}

// name важен для корректной группировки радио
function sectionName(sectionId: string) {
  return sectionId === 'seasons' ? 'season' : `${sectionId}[]`
}

// счётчик выбранных опций в секции
function selectedCount(section: FilterSection) {
  return section.options.reduce((n, o) => n + (o.checked ? 1 : 0), 0)
}
</script>
