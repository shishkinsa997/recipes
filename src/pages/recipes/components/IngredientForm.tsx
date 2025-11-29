import { useState } from 'react'
import type { Product, RecipeIngredient } from '../../../app/types'

interface IngredientFormProps {
  ingredient?: RecipeIngredient & { product?: Product }
  products: Product[]
  onSave: (ingredientData: Omit<RecipeIngredient, 'id' | 'created_at'>) => void
  onCancel: () => void
  isEditing?: boolean
}

export function IngredientForm({
  ingredient,
  products,
  onSave,
  onCancel,
  isEditing = false
}: IngredientFormProps) {
  const initialFormData = {
    product_id: ingredient?.product_id || '',
    quantity: ingredient?.quantity || 1,
    measure: ingredient?.measure || 'шт' as const,
    price: ingredient?.price || 0
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalPrice = formData.quantity * formData.price

  const formKey = ingredient?.id || 'new'

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product'
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave({
        recipe_id: ingredient?.recipe_id || 'temp-recipe-id',
        product_id: formData.product_id,
        quantity: formData.quantity,
        measure: formData.measure,
        price: formData.price,
        total_price: totalPrice
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

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId)
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        product_id: productId,
        price: selectedProduct.price,
        measure: selectedProduct.unit
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        product_id: productId
      }))
    }
  }

  const selectedProduct = products.find(p => p.id === formData.product_id)

  return (
    <form key={formKey} onSubmit={handleSubmit} className="ingredient-form">
      <div className="ingredient-form__row">
        <div className="form-group">
          <label className="form-label">Product</label>
          <select
            value={formData.product_id}
            onChange={(e) => handleProductChange(e.target.value)}
            className={`form-select ${errors.product_id ? 'form-input--error' : ''}`}
            disabled={isEditing}
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.emoji} {product.name} (${product.price}/ {product.unit})
              </option>
            ))}
          </select>
          {errors.product_id && (
            <span className="form-error">{errors.product_id}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
            className={`form-input ${errors.quantity ? 'form-input--error' : ''}`}
          />
          {errors.quantity && (
            <span className="form-error">{errors.quantity}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Unit</label>
          <select
            value={formData.measure}
            onChange={(e) => handleChange('measure', e.target.value)}
            className="form-select"
          >
            <option value="шт">шт</option>
            <option value="гр">гр</option>
            <option value="мл">мл</option>
          </select>
        </div>
      </div>

      <div className="ingredient-form__row">
        <div className="form-group">
          <label className="form-label">Price per unit</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            className={`form-input ${errors.price ? 'form-input--error' : ''}`}
          />
          {errors.price && (
            <span className="form-error">{errors.price}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Total cost</label>
          <div className="total-price">
            ${totalPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="product-info">
          <small>
            Selected: {selectedProduct.emoji} {selectedProduct.name}
            (${selectedProduct.price} / {selectedProduct.unit})
          </small>
        </div>
      )}

      <div className="ingredient-form__actions">
        <button
          type="button"
          className="btn btn--outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
        >
          {isEditing ? 'Update' : 'Add'} Ingredient
        </button>
      </div>
    </form>
  )
}