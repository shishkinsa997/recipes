import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRecipes, useDeleteRecipe, useCreateRecipeWithIngredients, useUpdateRecipeWithIngredients } from '../../app/hooks/useRecipes'
import { Button } from '../../app/components/ui/Button'
import { RecipeCard } from './components/RecipeCard'
import { SearchBar } from './components/SearchBar'
import { FilterPanel, type RecipeFilters } from './components/FilterPanel'
import { RecipeForm } from './components/RecipeForm'
import { recipeService } from '../../app/services/recipeService'
import type { Recipe, RecipeIngredient, Product } from '../../app/types'
import './RecipesPage.scss'

export function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: recipes, isLoading, error } = useRecipes()
  const createRecipeMutation = useCreateRecipeWithIngredients()
  const updateRecipeMutation = useUpdateRecipeWithIngredients()
  const deleteRecipeMutation = useDeleteRecipe()

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<RecipeFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<(Recipe & { ingredients?: (RecipeIngredient & { product: Product })[] }) | null>(null)

  const handleEditRecipe = useCallback(async (recipe: Recipe) => {
    try {
      const fullRecipeData = await recipeService.getRecipeById(recipe.id)
      setEditingRecipe({
        ...fullRecipeData.recipe,
        ingredients: fullRecipeData.ingredients
      })
      setIsFormOpen(true)
    } catch (err) {
      console.error('Failed to load recipe details:', err)
      setEditingRecipe(recipe)
      setIsFormOpen(true)
    }
  }, [])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && recipes && !isFormOpen) {
      const recipeToEdit = recipes.find(r => r.id === editId)
      if (recipeToEdit) {
        setTimeout(() => {
          handleEditRecipe(recipeToEdit)
        }, 0)
        setSearchParams({}, { replace: true })
      }
    }
  }, [searchParams, recipes, isFormOpen, handleEditRecipe, setSearchParams])

  const sortRecipes = (recipesToSort: Recipe[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...recipesToSort].sort((a, b) => {
      if (sortBy === 'title') {
        const aTitle = a.title.toLowerCase()
        const bTitle = b.title.toLowerCase()
        return sortOrder === 'asc'
          ? aTitle.localeCompare(bTitle)
          : bTitle.localeCompare(aTitle)
      }

      if (sortBy === 'final_price') {
        return sortOrder === 'asc'
          ? a.final_price - b.final_price
          : b.final_price - a.final_price
      }

      if (sortBy === 'created_at') {
        const aDate = new Date(a.created_at).getTime()
        const bDate = new Date(b.created_at).getTime()
        return sortOrder === 'asc'
          ? aDate - bDate
          : bDate - aDate
      }

      return 0
    })
  }

  const filteredRecipes = useMemo(() => {
    if (!recipes) return []

    let result = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filters.maxPrice !== undefined) {
      result = result.filter(recipe => recipe.final_price <= filters.maxPrice!)
    }

    return sortRecipes(result, filters.sortBy, filters.sortOrder)
  }, [recipes, searchTerm, filters])

  const handleCreateRecipe = () => {
    setEditingRecipe(null)
    setIsFormOpen(true)
  }

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      try {
        await deleteRecipeMutation.mutateAsync(recipe.id)
      } catch (err) {
        const error = err as Error
        alert(`Failed to delete recipe: ${error.message}`)
      }
    }
  }

  const handleSubmitRecipe = async (recipeData: {
    recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
    ingredients: Omit<RecipeIngredient, 'id' | 'created_at'>[]
  }) => {
    try {
      console.log('Submitting recipe data:', recipeData)

      if (editingRecipe) {
        await updateRecipeMutation.mutateAsync({
          id: editingRecipe.id,
          updates: recipeData.recipe,
          ingredients: recipeData.ingredients.map(ing => ({
            ...ing,
            recipe_id: editingRecipe.id
          }))
        })
      } else {
        await createRecipeMutation.mutateAsync({
          recipe: recipeData.recipe,
          ingredients: recipeData.ingredients.map(ing => ({
            ...ing,
            recipe_id: 'temp-id'
          }))
        })
      }
      setIsFormOpen(false)
      setEditingRecipe(null)
    } catch (err) {
      const error = err as Error
      console.error('Error saving recipe:', error)
      alert(`Failed to save recipe: ${error.message}`)
    }
  }

  const hasActiveFilters = searchTerm !== '' || filters.maxPrice !== undefined

  if (error) {
    return (
      <div className="error-state">
        <h2>Error loading recipes</h2>
        <p>{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="recipes-page">
      <div className="recipes-page__header">
        <h1>Recipes</h1>
        <Button onClick={handleCreateRecipe}>
          Create Recipe
        </Button>
      </div>

      <div className="recipes-page__controls">
        <div className="recipes-page__search">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search recipes by name or description..."
          />
        </div>

        <div className="recipes-page__filters">
          <FilterPanel onFilterChange={setFilters} />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Loading recipes...</p>
        </div>
      ) : (
        <div className="recipes-page__content">
          {filteredRecipes.length === 0 ? (
            <div className="empty-state">
              {hasActiveFilters ? (
                <>
                  <h3>No recipes found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </>
              ) : (
                <>
                  <h3>No recipes yet</h3>
                  <p>Get started by creating your first recipe</p>
                  <Button onClick={handleCreateRecipe}>
                    Create First Recipe
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="recipes-stats">
                Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </div>

              <div className="recipes-grid">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onEdit={handleEditRecipe}
                    onDelete={handleDeleteRecipe}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <RecipeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingRecipe(null)
        }}
        onSubmit={handleSubmitRecipe}
        recipe={editingRecipe || undefined}
        isLoading={createRecipeMutation.isPending || updateRecipeMutation.isPending}
      />
    </div>
  )
}