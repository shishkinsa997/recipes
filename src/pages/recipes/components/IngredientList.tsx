import type { RecipeIngredient, Product } from '../../../app/types'

interface IngredientListProps {
  ingredients: (RecipeIngredient & { product: Product })[]
  onEdit: (ingredient: RecipeIngredient & { product: Product }) => void
  onDelete: (ingredientId: string) => void
}

export function IngredientList({ ingredients, onEdit, onDelete }: IngredientListProps) {
  const totalCost = ingredients.reduce((sum, ingredient) => sum + ingredient.total_price, 0)

  if (ingredients.length === 0) {
    return (
      <div className="empty-ingredients">
        <p>No ingredients added yet</p>
      </div>
    )
  }

  return (
    <div className="ingredient-list">
      <div className="ingredient-list__header">
        <h3>Ingredients</h3>
        <div className="total-cost">
          Total: ${totalCost.toFixed(2)}
        </div>
      </div>

      <div className="ingredient-list__items">
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="ingredient-item">
            <div className="ingredient-item__main">
              <span className="ingredient-emoji">
                {ingredient.product.emoji}
              </span>
              <div className="ingredient-details">
                <div className="ingredient-name">
                  {ingredient.product.name}
                </div>
                <div className="ingredient-quantity">
                  {ingredient.quantity} {ingredient.measure}
                </div>
              </div>
            </div>

            <div className="ingredient-item__price">
              <div className="ingredient-unit-price">
                ${ingredient.price} / {ingredient.product.unit}
              </div>
              <div className="ingredient-total-price">
                ${ingredient.total_price.toFixed(2)}
              </div>
            </div>

            <div className="ingredient-item__actions">
              <button
                className="btn btn--outline btn--sm"
                onClick={() => onEdit(ingredient)}
              >
                Edit
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={() => onDelete(ingredient.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}