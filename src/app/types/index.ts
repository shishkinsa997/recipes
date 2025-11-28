export type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  user_id: string
  name: string
  emoji: string
  unit: 'гр' | 'мл' | 'шт'
  price: number
  created_at: string
  updated_at: string
}

export type Recipe = {
  id: string
  user_id: string
  title: string
  image_url: string | null
  description: string | null
  servings: number
  final_price: number
  created_at: string
  updated_at: string
}

export type RecipeIngredient = {
  id: string
  recipe_id: string
  product_id: string
  quantity: number
  measure: 'гр' | 'мл' | 'шт'
  price: number
  total_price: number
  created_at: string
}