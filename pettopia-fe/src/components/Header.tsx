"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="flex justify-between bg-gray-200 p-4">
      <nav className="flex gap-4">
        <Link href="/home">Home</Link>
        <Link href="/login">Login</Link>
      </nav>
      {user && (
        <div>
          <span className="mr-2">Xin chào, {user.name}</span>
          <button onClick={logout} className="bg-red-500 text-white p-1 rounded">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
