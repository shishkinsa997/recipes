import { useState, useMemo } from 'react';
import { useRecipes } from '../../app/hooks/useRecipes';
import { Button } from '../../app/components/ui/Button';
import { RecipeCard } from './components/RecipeCard';
import { SearchBar } from './components/SearchBar';
import { FilterPanel, type RecipeFilters } from './components/FilterPanel';
import './RecipesPage.scss';

export function RecipesPage() {
  const { data: recipes, isLoading, error } = useRecipes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];

    let result = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.maxPrice) {
      result = result.filter(
        (recipe) => recipe.final_price <= filters.maxPrice!
      );
    }

    result.sort((a, b) => {
      let aValue: string | number | Date = a[filters.sortBy];
      let bValue: string | number | Date = b[filters.sortBy];

      if (filters.sortBy === 'title') {
        aValue = (aValue as string)?.toLowerCase() || '';
        bValue = (bValue as string)?.toLowerCase() || '';
      }

      if (filters.sortBy === 'created_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [recipes, searchTerm, filters]);

  const handleCreateRecipe = () => {
    alert('Create recipe functionality will be added in the next phase');
  };

  if (error) {
    return (
      <div className="error-state">
        <h2>Error loading recipes</h2>
        <p>{error.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="recipes-page">
      <div className="recipes-page__header">
        <h1>Recipes</h1>
        <Button onClick={handleCreateRecipe}>Create Recipe</Button>
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
              {searchTerm || filters.maxPrice ? (
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
                Found {filteredRecipes.length} recipe
                {filteredRecipes.length !== 1 ? 's' : ''}
              </div>

              <div className="recipes-grid">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
