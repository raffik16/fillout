// Client-side API utilities for bars

export async function fetchBarDrinks(barId: string) {
  const response = await fetch(`/api/bars/${barId}/drinks`);
  if (!response.ok) {
    throw new Error('Failed to fetch drinks');
  }
  return response.json();
}

export async function fetchBarBySlug(slug: string) {
  const response = await fetch(`/api/bars/by-slug/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bar');
  }
  return response.json();
}