'use client';

import React, { useState, useEffect, JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCustomerById } from "@/services/user/userService";

interface User {
    id: string;
    fullname: string;
    email: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
    address?: {
        city?: string;
        district?: string;
        ward?: string;
        detail?: string;
    };
    createdAt?: string;
}

export default function UserProfilePage(): JSX.Element {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Lấy userId từ localStorage
                const userId = localStorage.getItem('userId');

                if (!userId) {
                    setError('Không thể xác định người dùng');
                    router.push('/login');
                    return;
                }

                // Lấy thông tin user
                const userData = await getCustomerById(userId);
                
                const userInfo: User = {
                    id: userData.data?.id || userData.data?.user_id || userId,
                    fullname: userData.data?.fullname || userData.data?.name || 'Người dùng',
                    email: userData.data?.email || '',
                    phone: userData.data?.phone || userData.data?.phone_number || '',
                    bio: userData.data?.bio || '',
                    avatar_url: userData.data?.avatar_url || userData.data?.avatar || '/sampleimg/default-avatar.jpg',
                    address: userData.data?.address || {
                        city: '',
                        district: '',
                        ward: '',
                        detail: ''
                    },
                    createdAt: userData.data?.createdAt || ''
                };

                setUser(userInfo);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Không thể tải thông tin người dùng');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    if (loading) {
        return (
            <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: 18, color: "#666" }}>Đang tải thông tin...</div>
                </div>
            </main>
        );
    }

    if (error || !user) {
        return (
            <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
                <div style={{ 
                    padding: "20px", 
                    border: "1px solid #ff6b6b",
                    borderRadius: 8,
                    background: "#ffe0e0",
                    color: "#d32f2f",
                    textAlign: "center"
                }}>
                    <h2>{error || "Không thể tải thông tin người dùng"}</h2>
                    <Link href="/login">
                        <button style={{
                            marginTop: 12,
                            padding: "8px 16px",
                            background: "#d32f2f",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer"
                        }}>
                            Quay lại đăng nhập
                        </button>
                    </Link>
                </div>
            </main>
        );
    }

    const formatAddress = () => {
        if (!user.address) return 'Chưa cập nhật';
        const parts = [
            user.address.detail,
            user.address.ward,
            user.address.district,
            user.address.city
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa rõ';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    return (
        <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
            {/* Phần thông tin cơ bản */}
            <section
                style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                    padding: 20,
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
            >
                <img
                    src={user.avatar_url || '/sampleimg/default-avatar.jpg'}
                    alt={`${user.fullname} avatar`}
                    width={120}
                    height={120}
                    style={{ 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        border: "3px solid #0070f3",
                        flexShrink: 0
                    }}
                />
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: 28, color: "#000" }}>{user.fullname}</h1>
                    <p style={{ margin: "6px 0 0", color: "#666", fontSize: 16 }}>{user.email}</p>
                    
                    {user.phone && (
                        <p style={{ margin: "4px 0", color: "#666", fontSize: 14 }}>
                            📱 {user.phone}
                        </p>
                    )}
                    
                    {user.bio && (
                        <p style={{ marginTop: 12, color: "#555", fontSize: 14, fontStyle: "italic" }}>
                            "{user.bio}"
                        </p>
                    )}

                    <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                        <Link href="/user/edit-profile" style={{ textDecoration: "none" }}>
                            <button
                                style={{
                                    padding: "10px 16px",
                                    background: "#0070f3",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    transition: "background 0.3s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#0051cc"}
                                onMouseOut={(e) => e.currentTarget.style.background = "#0070f3"}
                            >
                                Chỉnh sửa hồ sơ
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Phần thông tin chi tiết */}
            <section
                style={{
                    marginTop: 24,
                    padding: 20,
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
            >
                <h2 style={{ marginTop: 0, fontSize: 20, color: "#000" }}>Thông tin chi tiết</h2>
                
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 20,
                    marginTop: 16
                }}>
                    {/* Email */}
                    <div style={{
                        padding: 12,
                        background: "#f9f9f9",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0"
                    }}>
                        <label style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>EMAIL</label>
                        <p style={{ margin: "6px 0 0", fontSize: 16, color: "#000" }}>
                            {user.email || 'Chưa cập nhật'}
                        </p>
                    </div>

                    {/* Số điện thoại */}
                    <div style={{
                        padding: 12,
                        background: "#f9f9f9",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0"
                    }}>
                        <label style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>SỐ ĐIỆN THOẠI</label>
                        <p style={{ margin: "6px 0 0", fontSize: 16, color: "#000" }}>
                            {user.phone || 'Chưa cập nhật'}
                        </p>
                    </div>

                    {/* ID người dùng */}
                    <div style={{
                        padding: 12,
                        background: "#f9f9f9",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0"
                    }}>
                        <label style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>MÃ NGƯỜI DÙNG</label>
                        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#666", fontFamily: "monospace", wordBreak: "break-all" }}>
                            {user.id}
                        </p>
                    </div>

                    {/* Ngày tham gia */}
                    <div style={{
                        padding: 12,
                        background: "#f9f9f9",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0"
                    }}>
                        <label style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>NGÀY THAM GIA</label>
                        <p style={{ margin: "6px 0 0", fontSize: 16, color: "#000" }}>
                            {formatDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div style={{ marginTop: 20 }}>
                    <h3 style={{ fontSize: 16, color: "#000", marginBottom: 12 }}>Địa chỉ</h3>
                    <div style={{
                        padding: 12,
                        background: "#f9f9f9",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0"
                    }}>
                        <p style={{ margin: 0, fontSize: 16, color: "#000", lineHeight: 1.6 }}>
                            {formatAddress()}
                        </p>
                    </div>
                </div>
            </section>

            {/* Phần hoạt động */}
            <section
                style={{
                    marginTop: 24,
                    padding: 20,
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
            >
                <h2 style={{ marginTop: 0, fontSize: 20, color: "#000" }}>Hoạt động</h2>
                <p style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>
                    Chức năng hoạt động đang phát triển
                </p>
            </section>
        </main>
    );
}