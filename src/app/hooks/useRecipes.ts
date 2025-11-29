import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeService } from '../services/recipeService'
import type { Recipe, RecipeIngredient } from '../types'

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => recipeService.getRecipes(),
  })
}

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipeService.getRecipeById(id),
    enabled: !!id,
  })
}

export const useSearchRecipes = (query: string) => {
  return useQuery({
    queryKey: ['recipes', 'search', query],
    queryFn: () => recipeService.searchRecipes(query),
    enabled: query.length > 0,
  })
}

export const useCreateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recipeService.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Recipe> }) =>
      recipeService.updateRecipe(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recipeService.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export const useCreateRecipeWithIngredients = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
      ingredients: Omit<RecipeIngredient, 'id' | 'created_at' | 'recipe_id'>[]
    }) => recipeService.createRecipeWithIngredients(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export const useUpdateRecipeWithIngredients = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      id: string
      updates: Partial<Recipe>
      ingredients: Omit<RecipeIngredient, 'id' | 'created_at'>[]
    }) => recipeService.updateRecipeWithIngredients(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] })
    },
  })
}