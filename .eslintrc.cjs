module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2022: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json'],
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:nuxt/recommended',
        'plugin:prettier/recommended',
        'standard-with-typescript'
    ],
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    rules: {
        'prettier/prettier': 'error',
        'vue/multi-word-component-names': 'off', // отключаем если используешь односоставные имена
        '@typescript-eslint/no-unused-vars': 'warn',
    },
}
