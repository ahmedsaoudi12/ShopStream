
const API_URL = 'https://dummyjson.com';

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error('Failed to load product details.');
  }

  return response.json();
};

export const getRelatedProducts = async (category, currentProductId) => {
  if (!category) return [];

  const response = await fetch(
    `${API_URL}/products/category/${encodeURIComponent(category)}`
  );

  if (!response.ok) {
    throw new Error('Failed to load related products.');
  }

  const data = await response.json();

  return (data.products || [])
    .filter((product) => product.id !== Number(currentProductId))
    .slice(0, 4);
};
