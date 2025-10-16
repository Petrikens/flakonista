<!-- components/catalog/ProductImageSkeleton.vue -->
<template>
  <div
    class="aspect-square w-full rounded-lg bg-gray-200 lg:aspect-auto lg:h-80 animate-pulse overflow-hidden"
    role="status"
    aria-label="Загрузка изображения"
  >
    <!-- Градиентная анимация -->
    <div
      class="h-full w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"
    ></div>

    <!-- Иконка изображения в центре (опционально) -->
    <div class="absolute inset-0 flex items-center justify-center">
      <svg
        class="w-16 h-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>

    <span class="sr-only">Загрузка изображения товара...</span>
  </div>
</template>

<style scoped>
/* Анимация скелетона (shimmer эффект) */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 0) 0%,
    rgba(229, 231, 235, 0.5) 50%,
    rgba(229, 231, 235, 0) 100%
  );
  background-size: 200% 100%;
}
</style>
