import { supabase } from './supabase'
import type { Recipe, RecipeIngredient, Product } from '../types'

export const recipeService = {
  // Получить все рецепты
  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`)
    }

    return data || []
  },

  // Получить рецепт по ID с ингредиентами
  async getRecipeById(id: string): Promise<{ recipe: Recipe; ingredients: (RecipeIngredient & { product: Product })[] }> {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (recipeError) {
      throw new Error(`Failed to fetch recipe: ${recipeError.message}`)
    }

    // Получаем ингредиенты с информацией о продуктах
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        *,
        product:products(*)
      `)
      .eq('recipe_id', id)

    if (ingredientsError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientsError.message}`)
    }

    return {
      recipe,
      ingredients: ingredients || []
    }
  },

  // Создать рецепт
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create recipe: ${error.message}`)
    }

    return data
  },

  // Обновить рецепт
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update recipe: ${error.message}`)
    }

    return data
  },

  // Удалить рецепт
  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }
  },

  // Поиск рецептов
  async searchRecipes(query: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search recipes: ${error.message}`)
    }

    return data || []
  }
}