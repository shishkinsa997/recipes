import { supabase } from './supabase'
import type { RecipeIngredient } from '../types'

export const ingredientService = {
  async addIngredient(ingredient: Omit<RecipeIngredient, 'id' | 'created_at'>): Promise<RecipeIngredient> {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert([ingredient])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add ingredient: ${error.message}`)
    }

    return data
  },

  async updateIngredient(id: string, updates: Partial<RecipeIngredient>): Promise<RecipeIngredient> {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update ingredient: ${error.message}`)
    }

    return data
  },

  async deleteIngredient(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ingredient: ${error.message}`)
    }
  },

  async deleteRecipeIngredients(recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId)

    if (error) {
      throw new Error(`Failed to delete recipe ingredients: ${error.message}`)
    }
  }
}