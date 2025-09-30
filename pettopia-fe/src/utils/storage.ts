export const setToken = (user: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
};
