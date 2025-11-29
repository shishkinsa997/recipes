import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipe } from '../../app/hooks/useRecipes'
import { useDeleteRecipe } from '../../app/hooks/useRecipes'
import { Button } from '../../app/components/ui/Button'
import './RecipeDetail.scss'

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useRecipe(id!)
  const deleteRecipeMutation = useDeleteRecipe()

  const recipeKey = data?.recipe.id || 'loading'
  const baseServings = data?.recipe.servings || 2
  const [currentServings, setCurrentServings] = useState(baseServings)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipeMutation.mutateAsync(id!)
        navigate('/')
      } catch (err) {
        console.error('Failed to delete recipe:', err)
        alert('Failed to delete recipe')
      }
    }
  }

  const handleEdit = () => {
    navigate(`/?edit=${id}`)
  }

  const calculatedIngredients = useMemo(() => {
    if (!data?.ingredients) return []

    const baseServings = data.recipe.servings
    const ratio = currentServings / baseServings

    return data.ingredients.map(ingredient => ({
      ...ingredient,
      calculatedQuantity: ingredient.quantity * ratio,
      calculatedTotalPrice: ingredient.total_price * ratio
    }))
  }, [data, currentServings])

  const totalCost = useMemo(() =>
    calculatedIngredients.reduce((sum, ingredient) => sum + ingredient.calculatedTotalPrice, 0),
    [calculatedIngredients]
  )

  if (isLoading) {
    return <div className="loading">Loading recipe...</div>
  }

  if (error || !data) {
    return (
      <div className="error-state">
        <h2>Recipe not found</h2>
        <p>{error?.message || 'Recipe does not exist'}</p>
        <Link to="/">
          <Button>Back to Recipes</Button>
        </Link>
      </div>
    )
  }

  const { recipe } = data

  return (
    <div key={recipeKey} className="recipe-detail">
      <div className="recipe-detail__header">
        <Link to="/" className="back-button">
          ← Back to Recipes
        </Link>
        <div className="recipe-detail__actions">
          <Button variant="outline" onClick={handleEdit}>
            Edit Recipe
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Recipe
          </Button>
        </div>
      </div>

      <div className="recipe-detail__content">
        <div className="recipe-detail__image">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} />
          ) : (
            <div className="recipe-image-placeholder">
              🍳
            </div>
          )}
        </div>

        <div className="recipe-detail__info">
          <h1>{recipe.title}</h1>
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}

          <div className="servings-selector">
            <label htmlFor="servings">Servings:</label>
            <input
              id="servings"
              type="number"
              min="1"
              value={currentServings}
              onChange={(e) => setCurrentServings(Number(e.target.value))}
            />
          </div>

          <div className="recipe-meta">
            <div className="meta-item">
              <span className="meta-label">Base servings:</span>
              <span className="meta-value">{recipe.servings}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Total cost:</span>
              <span className="meta-value">${totalCost.toFixed(2)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Cost per serving:</span>
              <span className="meta-value">${(totalCost / currentServings).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="recipe-detail__ingredients">
          <h2>Ingredients</h2>
          <div className="ingredients-list">
            {calculatedIngredients.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-item">
                <span className="ingredient-emoji">{ingredient.product.emoji}</span>
                <div className="ingredient-details">
                  <span className="ingredient-name">{ingredient.product.name}</span>
                  <span className="ingredient-quantity">
                    {ingredient.calculatedQuantity.toFixed(2)} {ingredient.measure}
                  </span>
                </div>
                <div className="ingredient-price">
                  ${ingredient.calculatedTotalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}