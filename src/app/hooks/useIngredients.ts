import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ingredientService } from '../services/ingredientService'
import type { RecipeIngredient } from '../types'

export const useAddIngredient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ingredientService.addIngredient,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipe_id] })
    },
  })
}

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RecipeIngredient> }) =>
      ingredientService.updateIngredient(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', data.recipe_id] })
    },
  })
}

export const useDeleteIngredient = () => {
  // const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ingredientService.deleteIngredient,
    // onSuccess: (_, variables) => {
    //   queryClient.invalidateQueries({ queryKey: ['recipes'] })
    // },
  })
}