const API_URL = "http://localhost:9999";

export async function loginService(username: string, password: string) {
  const res = await fetch(`${API_URL}/users?username=${username}&password=${password}`);
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

export async function getPostsService() {
  const res = await fetch(`${API_URL}/posts`);
  return res.json();
}

export async function getUserById(id: number) {
  const res = await fetch(`${API_URL}/users/${id}`);
  return res.json();
}
