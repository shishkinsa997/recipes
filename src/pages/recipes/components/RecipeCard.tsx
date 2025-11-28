import { Link } from 'react-router-dom'
import { Button } from '../../../app/components/ui/Button'
import type { Recipe } from '../../../app/types'

interface RecipeCardProps {
  recipe: Recipe
  onEdit?: (recipe: Recipe) => void
  onDelete?: (recipe: Recipe) => void
}

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const handleEdit = () => {
    onEdit?.(recipe)
  }

  const handleDelete = () => {
    onDelete?.(recipe)
  }

  return (
    <div className="recipe-card">
      <Link to={`/recipe/${recipe.id}`} className="recipe-card__link">
        <div className="recipe-card__image">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} />
          ) : (
            <div className="recipe-card__image-placeholder">
              🍳
            </div>
          )}
        </div>

        <div className="recipe-card__content">
          <h3 className="recipe-card__title">{recipe.title}</h3>

          {recipe.description && (
            <p className="recipe-card__description">
              {recipe.description}
            </p>
          )}

          <div className="recipe-card__meta">
            <span className="recipe-card__servings">
              {recipe.servings} порций
            </span>
            <span className="recipe-card__price">
              ${recipe.final_price.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      {(onEdit || onDelete) && (
        <div className="recipe-card__actions">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
