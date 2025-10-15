export async function getClinics() {
  const response = await fetch('');
  if (!response.ok) {
    throw new Error('Failed to fetch clinics');
  }
  return response.json(); // Assuming it returns [{id: string, name: string}, ...]
}