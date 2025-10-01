// "use client";
// import { createContext, useContext, useState } from "react";
// import { useRouter } from "next/navigation";
// import { setToken, getToken, clearToken } from "@/utils/storage";
// import { loginService } from "@/services/authService";

// type AuthContextType = {
//   user: any | null;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<any | null>(getToken());
//   const router = useRouter();

//   const login = async (username: string, password: string) => {
//     const foundUser = await loginService(username, password);
//     if (foundUser) {
//       setUser(foundUser);
//       setToken(foundUser);
//       router.push("/home");
//     } else {
//       alert("Sai tài khoản hoặc mật khẩu!");
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     clearToken();
//     router.push("/login");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// }
