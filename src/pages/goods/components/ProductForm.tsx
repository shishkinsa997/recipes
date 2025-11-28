import { useState } from 'react'
import { Modal } from '../../../app/components/ui/Modal'
import { Input } from '../../../app/components/ui/Input'
import { Button } from '../../../app/components/ui/Button'
import type { Product } from '../../../app/types'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void
  product?: Product | null
  isLoading?: boolean
}

const defaultProduct = {
  name: '',
  emoji: '🍕',
  unit: 'шт' as const,
  price: 0,
  user_id: '564f1518-35f0-4ece-8331-7af0485e8f97'
}

export function ProductForm({ isOpen, onClose, onSubmit, product, isLoading = false }: ProductFormProps) {
  const initialFormData = product ? {
    name: product.name,
    emoji: product.emoji,
    unit: product.unit,
    price: product.price,
    user_id: product.user_id
  } : defaultProduct

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClose = () => {
    setFormData(initialFormData)
    setErrors({})
    onClose()
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.emoji.trim()) {
      newErrors.emoji = 'Emoji is required'
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log('Submitting product:', formData)
      onSubmit(formData)
      setFormData(defaultProduct)
      setErrors({})
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? 'Edit Product' : 'Add Product'}
    >
      <form onSubmit={handleSubmit} className="product-form">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter product name"
          required
        />

        <Input
          label="Emoji"
          value={formData.emoji}
          onChange={(e) => handleChange('emoji', e.target.value)}
          error={errors.emoji}
          placeholder="Enter emoji"
          required
        />

        <div className="form-group">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            <option value="шт">Pieces (шт)</option>
            <option value="гр">Grams (гр)</option>
            <option value="мл">Milliliters (мл)</option>
          </select>
        </div>

        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          error={errors.price}
          placeholder="0.00"
          required
        />

        <div className="form-actions">
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
            {isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}