# Настройка автоимпортов Nuxt 3

## Проблема

TypeScript и ESLint не видят автоимпорты Nuxt 3 (компоненты, composables, stores, Vue API).

## Решение

### 1. Обновление типов

После изменений в `nuxt.config.ts` или структуре компонентов нужно обновить типы:

```bash
npx nuxi prepare
```

### 2. Перезагрузка TypeScript сервера в VS Code

1. Нажмите `Ctrl+Shift+P` (или `Cmd+Shift+P` на Mac)
2. Введите "TypeScript: Restart TS Server"
3. Нажмите Enter

### 3. Проверка конфигурации

#### `nuxt.config.ts`

Убедитесь, что есть настройка компонентов:

```typescript
components: [
  {
    path: '~/components',
    pathPrefix: false, // Отключает префиксы (CatalogView вместо CatalogCatalogView)
  },
],
```

#### `tsconfig.json`

Должен расширять `.nuxt/tsconfig.json`:

```json
{
  "extends": "./.nuxt/tsconfig.json",
  ...
}
```

#### `.eslintrc.cjs`

Должен включать `plugin:nuxt/recommended`:

```javascript
extends: [
  ...
  'plugin:nuxt/recommended',
  ...
]
```

### 4. Что автоматически импортируется

#### Vue API

- `ref`, `computed`, `reactive`, `watch`, `onMounted`, и т.д.

#### Nuxt Composables

- `useRouter`, `useRoute`, `useState`, `useAsyncData`, `useFetch`, `useNuxtApp`, `useSeoMeta`, `createError`, `$fetch`, `navigateTo`

#### Компоненты

- Все компоненты из `components/` (без префиксов благодаря `pathPrefix: false`)

#### Composables

- Все composables из `composables/` (например, `useApi`, `useInfiniteProducts`)

#### Stores

- Все stores из `stores/` через Pinia (например, `useCartStore`, `useFavoritesStore`, `useUiStore`)

### 5. Если проблемы остаются

1. Удалите `.nuxt` папку и пересоздайте типы:

```bash
rm -rf .nuxt
npx nuxi prepare
```

2. Перезапустите TypeScript сервер в VS Code

3. Проверьте, что в `package.json` есть скрипт:

```json
"postinstall": "nuxt prepare"
```

4. Убедитесь, что используете актуальную версию Nuxt 3 (3.10.0+)

## Примечание

Если TypeScript все еще показывает ошибки, но код компилируется и работает - это может быть проблема кэша TypeScript сервера. Перезагрузка сервера должна помочь.
