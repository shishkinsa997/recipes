import { useState } from 'react'

interface FilterPanelProps {
  onFilterChange: (filters: RecipeFilters) => void
}

export interface RecipeFilters {
  sortBy: 'title' | 'final_price' | 'created_at'
  sortOrder: 'asc' | 'desc'
  maxPrice?: number
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<RecipeFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (newFilters: Partial<RecipeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <button
          className="btn btn--outline filter-panel__toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          Filters {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <div className="filter-panel__content">
          <div className="filter-group">
            <label className="filter-label">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({
                sortBy: e.target.value as RecipeFilters['sortBy']
              })}
              className="filter-select"
            >
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="final_price">Price</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange({
                sortOrder: e.target.value as RecipeFilters['sortOrder']
              })}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Max Price</label>
            <input
              type="number"
              placeholder="No limit"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange({
                maxPrice: e.target.value ? Number(e.target.value) : undefined
              })}
              className="filter-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}
    </div>
  )
}