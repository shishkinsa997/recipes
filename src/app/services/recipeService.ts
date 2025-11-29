import { supabase } from './supabase'
import type { Recipe, RecipeIngredient, Product } from '../types'
import { ingredientService } from './ingredientService'

export const recipeService = {
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

  async getRecipeById(id: string): Promise<{ recipe: Recipe; ingredients: (RecipeIngredient & { product: Product })[] }> {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (recipeError) {
      throw new Error(`Failed to fetch recipe: ${recipeError.message}`)
    }

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

  async createRecipeWithIngredients(data: {
    recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
    ingredients: Omit<RecipeIngredient, 'id' | 'created_at' | 'recipe_id'>[]
  }): Promise<Recipe> {
    const createdRecipe = await this.createRecipe(data.recipe)

    if (data.ingredients.length > 0) {
      const ingredientsToInsert = data.ingredients.map(ing => ({
        ...ing,
        recipe_id: createdRecipe.id
      }))

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert)

      if (ingredientsError) {
        await this.deleteRecipe(createdRecipe.id)
        throw new Error(`Failed to create ingredients: ${ingredientsError.message}`)
      }
    }

    return createdRecipe
  },

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

  async updateRecipeWithIngredients(data: {
    id: string
    updates: Partial<Recipe>
    ingredients: Omit<RecipeIngredient, 'id' | 'created_at'>[]
  }): Promise<Recipe> {
    const updatedRecipe = await this.updateRecipe(data.id, data.updates)

    await ingredientService.deleteRecipeIngredients(data.id)

    if (data.ingredients.length > 0) {
      const ingredientsToInsert = data.ingredients.map(ing => ({
        ...ing,
        recipe_id: data.id
      }))

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert)

      if (ingredientsError) {
        throw new Error(`Failed to update ingredients: ${ingredientsError.message}`)
      }
    }

    return updatedRecipe
  },

  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }
  },

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