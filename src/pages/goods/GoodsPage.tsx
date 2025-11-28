import { useState } from 'react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../app/hooks/useProducts'
import { Button } from '../../app/components/ui/Button'
import { Input } from '../../app/components/ui/Input'
import { ProductForm } from './components/ProductForm'
import type { Product } from '../../app/types'
import './GoodsPage.scss'

export function GoodsPage() {
  const { data: products, isLoading, error } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreate = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct.mutateAsync(product.id)
      } catch (error) {
        console.error('Failed to delete product', error)
      }
    }
  }

  const handleSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Handle submit called with:', productData)
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          updates: productData
        })
      } else {
        await createProduct.mutateAsync(productData)
      }
      setIsFormOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.log('Failed to save product', error)
    }
  }

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (error) {
    return (
      <div className="error-state">
        <h2>Error loading products</h2>
        <p>{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="goods-page">
      <div className="goods-page__header">
        <h1>Products</h1>
        <Button onClick={handleCreate}>
          Add Product
        </Button>
      </div>

      <div className="goods-page__search">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="goods-page__content">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <>
                  <h3>No products found</h3>
                  <p>Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <h3>No products yet</h3>
                  <p>Get started by adding your first product</p>
                  <Button onClick={handleCreate}>
                    Add First Product
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card__header">
                    <span className="product-emoji">{product.emoji}</span>
                    <h3 className="product-name">{product.name}</h3>
                  </div>

                  <div className="product-card__details">
                    <div className="product-price">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="product-unit">
                      per {product.unit}
                    </div>
                  </div>

                  <div className="product-card__actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />
    </div>
  )
}