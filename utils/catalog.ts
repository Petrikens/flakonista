export const SEASONS = [
  { value: 'fall_winter', label: 'Осень–Зима' },
  { value: 'spring_summer', label: 'Весна–Лето' },
  { value: 'all_seasons', label: 'Всесезонный' },
] as const

export const PROFILE_TAGS = [
  'Свежий',
  'Сладкий',
  'Цитрусовый',
  'Древесный',
  'Пряный',
  'Теплый',
  'Пудровый',
  'Гурманский',
  'Табачный',
  'Кофейный',
  'Удовый',
  'Восточный',
  'Фруктовый',
  'Кожаный',
  'Дымный',
  'Мускусный',
  'Ванильный',
  'Универсальный',
  'Чайный',
  'Вечерний',
  'Повседневный',
  'Минеральный',
  'Молочный',
] as const

export type ProfileTag = (typeof PROFILE_TAGS)[number]

export type SeasonValue = (typeof SEASONS)[number]['value']
