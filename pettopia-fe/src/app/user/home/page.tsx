'use client'
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Chat from '@/components/Chat';
import Link from "next/link";
import PetCards from '@/components/NumberofPet';

// Tách Chat widget và button thành component riêng để tránh re-render
const ChatWidget = memo(function ChatWidget({
  showChat,
  setShowChat,
  chatSuggestions
}: {
  showChat: boolean;
  setShowChat: (v: boolean) => void;
  chatSuggestions: Array<{ icon: string; text: string; tag?: string }>;
}) {
  return (
    <>
      {/* Chat Widget */}
      <Chat
        showChat={showChat}
        setShowChat={setShowChat}
        chatSuggestions={chatSuggestions}
      />

      {/* Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className={`fixed bottom-4 right-4 w-14 h-14 sm:w-16 sm:h-16 sm:bottom-6 sm:right-6 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full shadow-lg flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-all duration-200 z-40 hover:shadow-xl ${showChat ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Mở chat"
      >
        💬
      </button>
    </>
  );
});

// Tách Pet Registration Banner thành component riêng
const PetRegistrationBanner = memo(function PetRegistrationBanner() {
  return (
    <section className="mb-12" aria-labelledby="register-heading">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {/* Background decoration */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" aria-hidden="true" />
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" aria-hidden="true" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <h2 id="register-heading" className="text-3xl font-bold text-white">
                Bạn đã đăng ký thú cưng chưa?
              </h2>
            </div>
            <p className="text-cyan-50 text-lg mb-6">
              Đăng ký hồ sơ để theo dõi sức khỏe và chăm sóc thú cưng của bạn tốt hơn
            </p>
            <Link href="/user/register-pet">
              <button className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600">
                Đăng ký ngay →
              </button>
            </Link>
          </div>

          {/* Decorative pet icons */}
          <div className="flex gap-4 text-6xl opacity-80">
            <span className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>🐕</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}>🐈</span>
            <span className="animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2s' }}>🐇</span>
          </div>
        </div>
      </div>
    </section>
  );
});

// Tách Recent Items thành component riêng
const RecentlyVisited = memo(function RecentlyVisited() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const recentItems = useMemo(() => [
    {
      id: 1,
      title: 'Hồ sơ thú cưng',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop',
      time: '1w ago',
      icon: '🐾'
    },
    {
      id: 2,
      title: 'Lịch khám sắp tới',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=200&fit=crop',
      time: '2d ago',
      icon: '📅'
    },
    {
      id: 3,
      title: 'Nhật ký hôm nay',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1443&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      time: '1d ago',
      icon: '📝',
      color: 'from-teal-600 to-cyan-600'
    },
    {
      id: 4,
      title: 'Community',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
      time: '3h ago',
      icon: '💬'
    },
    {
      id: 5,
      title: 'Dịch vụ ký gửi',
      image: 'https://images.unsplash.com/photo-1548620848-d375c7919ea2?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      time: '1w ago',
      icon: '🏨',
      color: 'from-teal-500 to-cyan-500'
    }
  ], []);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">Truy cập gần đây</h2>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer"
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={`rounded-xl overflow-hidden mb-3 aspect-video transition-all duration-300 shadow-md hover:shadow-xl ${hoveredCard === item.id ? 'scale-105' : ''}`}>
              {item.image ? (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <span className="text-4xl">{item.icon}</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 text-gray-900">{item.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-4 h-4 bg-teal-100 rounded-full" />
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Tách Quick Actions thành component riêng
const QuickActions = memo(function QuickActions() {
  const quickActions = useMemo(() => [
    {
      id: 1,
      title: 'Quản lí hồ sơ Pet',
      description: 'Thông tin, sức khỏe, lịch sử khám',
      icon: '',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Đặt lịch khám',
      description: 'Đặt hẹn với bác sĩ thú y',
      icon: '',
      color: 'from-teal-600 to-cyan-600',
      image: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fHww'
    },
    {
      id: 3,
      title: 'Pet Hotel & Services',
      description: 'Dịch vụ ký gửi và chăm sóc',
      icon: '',
      color: 'from-cyan-600 to-teal-600',
      image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZG9nfGVufDB8fDB8fHww'
    }
  ], []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">Thao tác nhanh</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {quickActions.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden"
            style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
              <p className="text-sm text-cyan-50">{item.description}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-600 opacity-40 rounded-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Tách Pet Cards Section thành component riêng
const PetCardsSection = memo(function PetCardsSection({
  userId,
  refreshKey,
  petsLoading,
  onPetsLoaded,
  onRefresh
}: {
  userId: string;
  refreshKey: number;
  petsLoading: boolean;
  onPetsLoaded: (count: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        
      </div>
      <PetCards key={refreshKey} userId={userId} onPetsLoaded={onPetsLoaded} />
    </div>
  );
});

export default function PetCareApp() {
  const [showChat, setShowChat] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPets, setHasPets] = useState<boolean>(false);
  const [petsLoading, setPetsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const parseJwt = (token: string | null) => {
      if (!token) return null;
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      } catch (e) {
        console.error('Failed to parse JWT', e);
        return null;
      }
    };

    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('authToken');
    let id = localStorage.getItem('userId');

    if (!id && token) {
      const decoded = parseJwt(token);
      const resolved = decoded?.userId ?? decoded?.id ?? decoded?.sub ?? null;
      if (resolved) {
        id = String(resolved);
        localStorage.setItem('userId', id);
      }
    }

    if (id) setUserId(id);
  }, []);

  // Callback được memo hóa để tránh re-render PetCards
  const handlePetsLoaded = useCallback((petsCount: number) => {
    setHasPets(petsCount > 0);
    setPetsLoading(false);
  }, []);

  // Hàm refresh pets được memo hóa
  const handleRefreshPets = useCallback(() => {
    setPetsLoading(true);
    setRefreshKey(prev => prev + 1);
  }, []);

  const chatSuggestions = useMemo(() => [
    { icon: '🐾', text: 'Quản lí hồ sơ Pet', tag: 'New' },
    { icon: '📝', text: 'Viết nhật ký cho pet' },
    { icon: '📊', text: 'Xem báo cáo sức khỏe' },
    { icon: '✅', text: 'Tạo nhắc nhở khám định kỳ', tag: 'New' }
  ], []);

  return (
    <div className="max-w-6xl mx-auto p-12">
      {/* Header */}
      <h1 className="text-5xl font-extrabold mb-12 text-teal-800 tracking-tight whitespace-nowrap">
        Community
      </h1>

      {/* Pet Registration Banner - Chỉ hiện khi chưa có thú cưng */}
      {(!petsLoading && !hasPets) && <PetRegistrationBanner />}

      {/* Pet Cards Section với Refresh Button */}
      {userId ? (
        <PetCardsSection
          userId={userId}
          refreshKey={refreshKey}
          petsLoading={petsLoading}
          onPetsLoaded={handlePetsLoaded}
          onRefresh={handleRefreshPets}
        />
      ) : (
        <div className="text-sm text-gray-500">Loading pets...</div>
      )}

      {/* Recently Visited */}
      <RecentlyVisited />

      {/* Quick Actions */}
      <QuickActions />

      {/* Chat Widget và Button */}
      <ChatWidget
        showChat={showChat}
        setShowChat={setShowChat}
        chatSuggestions={chatSuggestions}
      />
    </div>
  );
}