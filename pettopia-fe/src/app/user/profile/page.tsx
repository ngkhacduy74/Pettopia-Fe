'use client';

import React, { useState, useEffect, JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCustomerProfile } from "@/services/user/userService";

interface User {
  id: string;
  fullname: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
    detail?: string;
  };
  dob?: string;
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
        const hasToken =
          typeof window !== "undefined" ? !!localStorage.getItem("authToken") : false;
        if (!hasToken) {
          setError('Vui lòng đăng nhập để xem trang này');
          router.push('/login');
          return;
        }

        const data = await getCustomerProfile();
        if (!data) {
          setError('Không tìm thấy thông tin người dùng');
          setUser(null);
          return;
        }

        const mapped: User = {
          id: data.id || data._id || data.customer_id || '',
          fullname: data.fullname || data.username || 'Người dùng',
          username: data.username,
          email: typeof data.email === 'string' ? data.email : data.email?.email_address || '',
          phone: typeof data.phone === 'string' ? data.phone : data.phone?.phone_number || '',
          avatar_url: data.avatar_url || data.avatar || '/sampleimg/default-avatar.jpg',
          address: data.address || { city: '', district: '', ward: '', detail: '' },
          dob: data.dob || '',
          createdAt: data.createdAt || data.created_at || ''
        };

        setUser(mapped);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err?.message || 'Không thể tải thông tin người dùng');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #333',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ fontSize: '14px', color: '#666' }}>Đang tải...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
            {error || "Không thể tải thông tin"}
          </h2>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 24px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Đăng nhập
            </button>
          </Link>
        </div>
      </div>
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
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Profile Header */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
            <img
              src={user.avatar_url || '/sampleimg/default-avatar.jpg'}
              alt={user.fullname}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '3px solid #f5f5f5'
              }}
            />
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h1 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '28px', 
                fontWeight: 600,
                color: '#1a1a1a'
              }}>
                {user.fullname}
              </h1>
              
              {user.username && (
                <div style={{ 
                  color: '#666', 
                  fontSize: '15px',
                  marginBottom: '16px'
                }}>
                  @{user.username}
                </div>
              )}

              <Link href="/user/edit-profile" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    padding: '10px 20px',
                    background: '#548c99ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#1a1a1a'}
                >
                  Chỉnh sửa hồ sơ
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 24px 0', 
            fontSize: '18px', 
            fontWeight: 600,
            color: '#1a1a1a',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '12px'
          }}>
            Thông tin cá nhân
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '6px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </div>
              <div style={{ fontSize: '15px', color: '#333' }}>
                {user.email || 'Chưa cập nhật'}
              </div>
            </div>

            {/* Phone */}
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '6px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Số điện thoại
              </div>
              <div style={{ fontSize: '15px', color: '#333' }}>
                {user.phone || 'Chưa cập nhật'}
              </div>
            </div>

            {/* DOB */}
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '6px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Ngày sinh
              </div>
              <div style={{ fontSize: '15px', color: '#333' }}>
                {formatDate(user.dob)}
              </div>
            </div>

            {/* Address */}
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '6px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Địa chỉ
              </div>
              <div style={{ fontSize: '15px', color: '#333', lineHeight: 1.6 }}>
                {formatAddress()}
              </div>
            </div>

            {/* Join Date */}
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#888',
                marginBottom: '6px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Ngày tham gia
              </div>
              <div style={{ fontSize: '15px', color: '#333' }}>
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}