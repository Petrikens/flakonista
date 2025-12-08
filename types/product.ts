import type { ProfileTag } from '~/utils/catalog'

export type Gender = 'men' | 'women' | 'unisex'

export type SeasonGroup = 'fall_winter' | 'spring_summer' | 'all_seasons'

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
  price_3ml?: number | null | undefined
  price_5ml?: number | null | undefined
  price_10ml?: number | null | undefined
  price_15ml?: number | null | undefined
  price_60ml?: number | null | undefined
  price_70ml?: number | null | undefined
  price_80ml?: number | null | undefined
  price_90ml?: number | null | undefined
  price_100ml?: number | null | undefined
  price_105ml?: number | null | undefined
  top_notes: string | null
  heart_notes: string | null
  basic_notes: string | null
  brand_id: string
  image_path: string[]
  brands?: Brand | null
  brand?: Brand
}

export interface Aromabox {
  id: string
  name: string
  gender: Gender
  suits: string | null
  benefits: string | null
  price_3ml?: number | null | undefined
  price_5ml?: number | null | undefined
  price_10ml?: number | null | undefined
  image_path: string[]
  season_group: SeasonGroup | null
  profile_tags: ProfileTag[]
  pack: string[]
  created_at: string
  updated_at: string
}
