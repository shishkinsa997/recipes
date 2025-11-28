import { useParams } from 'react-router-dom';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Recipe Details</h1>
      <p>Viewing recipe with ID: {id}</p>
    </div>
  );
}