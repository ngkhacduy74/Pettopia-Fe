import React, { JSX } from "react";
import Link from "next/link";

export const metadata = {
    title: "User Profile",
    description: "Basic user profile page",
};

interface User {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
}

const getMockUser = (): User => ({
    id: "u-123",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    bio: "Frontend engineer who loves building delightful interfaces.",
    avatarUrl: "https://via.placeholder.com/120?text=JD",
});

export default function UserProfilePage(): JSX.Element {
    const user = getMockUser();

    return (
        <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
            <section
                style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    padding: 20,
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    background: "#fff",
                }}
            >
                <img
                    src={user.avatarUrl}
                    alt={`${user.name} avatar`}
                    width={120}
                    height={120}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: 28 }}>{user.name}</h1>
                    <p style={{ margin: "6px 0 0", color: "#555" }}>{user.email}</p>
                    {user.bio && (
                        <p style={{ marginTop: 12, color: "#333" }}>{user.bio}</p>
                    )}
                    <div style={{ marginTop: 16 }}>
                        <Link href="/user/edit">
                            <a
                                style={{
                                    display: "inline-block",
                                    padding: "8px 12px",
                                    background: "#0070f3",
                                    color: "#fff",
                                    borderRadius: 6,
                                    textDecoration: "none",
                                }}
                            >
                                Edit profile
                            </a>
                        </Link>
                    </div>
                </div>
            </section>

            <section
                style={{
                    marginTop: 24,
                    padding: 20,
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    background: "#fff",
                }}
            >
                <h2 style={{ marginTop: 0 }}>Activity</h2>
                <p style={{ color: "#666" }}>No recent activity to show.</p>
            </section>
        </main>
    );
}