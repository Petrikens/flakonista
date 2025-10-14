export type Gender = 'men' | 'women' | 'unisex'

export type SeasonGroup = 'fall_winter' | 'spring_summer' | 'all_seasons'

export type ProfileTag =
  | 'Свежий'
  | 'Сладкий'
  | 'Цитрусовый'
  | 'Древесный'
  | 'Пряный'
  | 'Теплый'
  | 'Пудровый'
  | 'Гурманский'
  | 'Табачный'
  | 'Кофейный'
  | 'Удовый'
  | 'Восточный'
  | 'Фруктовый'
  | 'Кожаный'
  | 'Дымный'
  | 'Мускусный'
  | 'Ванильный'
  | 'Универсальный'
  | 'Чайный'
  | 'Вечерний'
  | 'Повседневный'
  | 'Минеральный'
  | 'Молочный'

export type NoteType = 'top' | 'heart' | 'base'

export interface Brand {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  gender: Gender
  suits: string | null
  benefits: string | null
  season_group: SeasonGroup | null
  occasions: string | null
  profile_tags: ProfileTag[]
  date_create: string
  price_2ml: number | null
  price_5ml: number | null
  price_10ml: number | null
  price_20ml: number | null
  price_100ml: number | null
  top_notes: string | null
  heart_notes: string | null
  basic_notes: string | null
  brand_id: string
  image_path: string
  brands?: Brand | null
  brand?: Brand
}
