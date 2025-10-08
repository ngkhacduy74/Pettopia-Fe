export async function getClinics() {
  const response = await fetch('http://localhost:9999/clinics');
  if (!response.ok) {
    throw new Error('Failed to fetch clinics');
  }
  return response.json(); // Assuming it returns [{id: string, name: string}, ...]
}