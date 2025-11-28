import { useState, useMemo } from 'react'
import { Modal } from '../../../app/components/ui/Modal'
import { Input } from '../../../app/components/ui/Input'
import { Button } from '../../../app/components/ui/Button'
import { IngredientForm } from './IngredientForm'
import { IngredientList } from './IngredientList'
import { useProducts } from '../../../app/hooks/useProducts'
import type { Recipe, RecipeIngredient, Product } from '../../../app/types'

interface RecipeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (recipeData: {
    recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
    ingredients: Omit<RecipeIngredient, 'id' | 'created_at'>[]
  }) => void
  recipe?: Recipe & { ingredients?: (RecipeIngredient & { product: Product })[] }
  isLoading?: boolean
}

const defaultRecipe = {
  title: '',
  description: '',
  image_url: '',
  servings: 2,
  final_price: 0,
  user_id: 'temp-user-id'
}

export function RecipeForm({ isOpen, onClose, onSubmit, recipe, isLoading = false }: RecipeFormProps) {
  const { data: products = [] } = useProducts()

  // Ключ для сброса состояния формы при изменении рецепта или открытии
  const formKey = useMemo(() =>
    `${recipe?.id || 'new'}-${isOpen ? 'open' : 'closed'}`,
    [recipe?.id, isOpen]
  )

  // Начальные состояния вычисляются при каждом рендере
  const initialFormData = recipe ? {
    title: recipe.title,
    description: recipe.description || '',
    image_url: recipe.image_url || '',
    servings: recipe.servings,
    final_price: recipe.final_price,
    user_id: recipe.user_id
  } : defaultRecipe

  const initialIngredients = recipe?.ingredients || []

  const [formData, setFormData] = useState(initialFormData)
  const [ingredients, setIngredients] = useState<(RecipeIngredient & { product: Product })[]>(initialIngredients)
  const [editingIngredient, setEditingIngredient] = useState<(RecipeIngredient & { product: Product }) | null>(null)
  const [showIngredientForm, setShowIngredientForm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Пересчет общей стоимости
  const totalCost = useMemo(() =>
    ingredients.reduce((sum, ingredient) => sum + ingredient.total_price, 0),
    [ingredients]
  )

  // Обновляем final_price при изменении totalCost
  const finalFormData = useMemo(() => ({
    ...formData,
    final_price: totalCost
  }), [formData, totalCost])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!finalFormData.title.trim()) {
      newErrors.title = 'Recipe title is required'
    }

    if (finalFormData.servings <= 0) {
      newErrors.servings = 'Servings must be greater than 0'
    }

    if (ingredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({
        recipe: finalFormData,
        ingredients: ingredients.map(ingredient => ({
          recipe_id: recipe?.id || 'temp-recipe-id',
          product_id: ingredient.product_id,
          quantity: ingredient.quantity,
          measure: ingredient.measure,
          price: ingredient.price,
          total_price: ingredient.total_price
        }))
      })
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleAddIngredient = (ingredientData: Omit<RecipeIngredient, 'id' | 'created_at'>) => {
    const product = products.find(p => p.id === ingredientData.product_id)
    if (!product) return

    const newIngredient: RecipeIngredient & { product: Product } = {
      id: editingIngredient?.id || `temp-${Date.now()}`,
      recipe_id: ingredientData.recipe_id,
      product_id: ingredientData.product_id,
      quantity: ingredientData.quantity,
      measure: ingredientData.measure,
      price: ingredientData.price,
      total_price: ingredientData.total_price,
      created_at: new Date().toISOString(),
      product: product
    }

    if (editingIngredient) {
      setIngredients(prev =>
        prev.map(ing => ing.id === editingIngredient.id ? newIngredient : ing)
      )
    } else {
      setIngredients(prev => [...prev, newIngredient])
    }

    setShowIngredientForm(false)
    setEditingIngredient(null)
  }

  const handleEditIngredient = (ingredient: RecipeIngredient & { product: Product }) => {
    setEditingIngredient(ingredient)
    setShowIngredientForm(true)
  }

  const handleDeleteIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId))
  }

  const handleClose = () => {
    onClose()
  }

  const costPerServing = finalFormData.servings > 0 ? totalCost / finalFormData.servings : 0

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={recipe ? 'Edit Recipe' : 'Create Recipe'}
    >
      <form key={formKey} onSubmit={handleSubmit} className="recipe-form">
        <div className="recipe-form__basic">
          <Input
            label="Recipe Title"
            value={finalFormData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="Enter recipe title"
            required
          />

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={finalFormData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="form-textarea"
              placeholder="Describe your recipe..."
              rows={3}
            />
          </div>

          <div className="recipe-form__row">
            <Input
              label="Image URL"
              value={finalFormData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            <Input
              label="Servings"
              type="number"
              min="1"
              value={finalFormData.servings}
              onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
              error={errors.servings}
              required
            />
          </div>
        </div>

        <div className="recipe-form__ingredients">
          <div className="ingredients-header">
            <h3>Ingredients</h3>
            {errors.ingredients && (
              <span className="form-error">{errors.ingredients}</span>
            )}
          </div>

          {showIngredientForm ? (
            <IngredientForm
              ingredient={editingIngredient ? {
                ...editingIngredient,
                product: editingIngredient.product
              } : undefined}
              products={products}
              onSave={handleAddIngredient}
              onCancel={() => {
                setShowIngredientForm(false)
                setEditingIngredient(null)
              }}
              isEditing={!!editingIngredient}
            />
          ) : (
            <div className="ingredients-actions">
              <Button
                type="button"
                onClick={() => setShowIngredientForm(true)}
              >
                Add Ingredient
              </Button>
            </div>
          )}

          <IngredientList
            ingredients={ingredients}
            onEdit={handleEditIngredient}
            onDelete={handleDeleteIngredient}
          />
        </div>

        <div className="recipe-form__summary">
          <div className="recipe-summary">
            <div className="summary-item">
              <span>Total Ingredients:</span>
              <span>{ingredients.length}</span>
            </div>
            <div className="summary-item">
              <span>Total Cost:</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Cost per Serving:</span>
              <span>${costPerServing.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="recipe-form__actions">
          <Button
            variant="outline"
            onClick={handleClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (recipe ? 'Update Recipe' : 'Create Recipe')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}