export async function submitVeterinarianData(data: any) {
  const response = await fetch('http://localhost:9999/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit data');
  }
  return response.json();
}