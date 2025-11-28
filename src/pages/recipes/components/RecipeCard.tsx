import { Link } from 'react-router-dom'
import type { Recipe } from '../../../app/types'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
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
  )
}