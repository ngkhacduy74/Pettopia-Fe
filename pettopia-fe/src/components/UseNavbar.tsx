'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { parseJwt, isTokenExpired } from '@/utils/jwt';
import { logoutUser } from '@/services/auth/authService';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getPetsByOwner, type PetDetailResponse } from '@/services/petcare/petService';

interface UserData {
  userId: string;
  fullname: string;
  gender?: string;
  email: {
    email_address: string;
    verified: boolean;
  };
  phone_number?: string;
  username: string;
  dob: string;
  address: {
    city: string;
    district: string;
    ward: string;
    description: string;
  };
}

type Pet = PetDetailResponse & {
  image?: string;
  imageUrl?: string;
  photo?: string;
  avatar?: string;
  type?: string;
};

interface UserNavbarProps {
  setShowSearch: (v: boolean) => void;
  showSearch: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  icon: JSX.Element;
  path: string;
  category: string;
  keywords: string[];
}

export default function UserNavbar({ setShowSearch, showSearch }: UserNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      name: 'Trang chủ',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /></svg>,
      path: '/user/home',
      category: 'Tổng quan',
      keywords: ['trang chủ', 'home', 'dashboard', 'tổng quan']
    },
    {
      id: 'list',
      name: 'Danh sách thú cưng',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" /></svg>,
      path: '/user/pet/list',
      category: 'Thú cưng',
      keywords: ['thú cưng', 'pet', 'danh sách', 'list', 'quản lý pet']
    },
    {
      id: 'register-pet',
      name: 'Đăng ký thú cưng mới',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>,
      path: '/user/pet/new',
      category: 'Thú cưng',
      keywords: ['đăng ký', 'thêm', 'register', 'add', 'pet mới', 'thú cưng mới']
    },
    {
      id: 'community',
      name: 'Cộng đồng Pettopia',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" /></svg>,
      path: '/user/community',
      category: 'Cộng đồng',
      keywords: ['cộng đồng', 'community', 'pettopia', 'social', 'bạn bè']
    },
    {
      id: 'manage',
      name: 'Quản lý bài viết',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 8a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zM4 9v6h12V9H4z" />
        <path d="M7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
      </svg>,
      path: '/user/community/manage',
      category: 'Cộng đồng',
      keywords: ['quản lý', 'bài viết', 'post', 'manage', 'nội dung', 'content']
    },
    {
      id: 'booking',
      name: 'Đặt lịch khám',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>,
      path: '/user/appointments/booking',
      category: 'Đặt lịch',
      keywords: ['lịch khám', 'booking', 'appointment', 'đặt lịch', 'khám bệnh', 'veterinary', 'bác sĩ thú y']
    },
    {
      id: 'view-appointments',
      name: 'Xem lịch khám',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M10.5 1.5H5.75A2.75 2.75 0 003 4.25v11A2.75 2.75 0 005.75 18h8.5A2.75 2.75 0 0117 15.25v-11A2.75 2.75 0 0014.25 1.5H10.5z" /><path d="M7 5h6M7 9h6M7 13h3" fill="white" opacity="0.3" /></svg>,
      path: '/user/appointments/list',
      category: 'Đặt lịch',
      keywords: ['xem', 'lịch khám', 'appointments', 'lịch hẹn', 'quản lý', 'lịch sử']
    },
    {
      id: 'prescription',
      name: 'Lịch sử khám',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" /></svg>,
      path: '/user/prescription',
      category: 'Đặt lịch',
      keywords: ['lịch sử', 'prescription', 'medicine', 'thuốc', 'y tế']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.includes(query))
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    const loadUserDataFromToken = () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error('No auth token found');
          setIsLoading(false);
          return;
        }

        if (isTokenExpired(token)) {
          console.error('Token expired');
          // Gọi hàm logout tối ưu để xoá tất cả dữ liệu
          logoutUser();
          router.replace('/auth/login');
          return;
        }

        const decodedToken = parseJwt(token);

        if (!decodedToken) {
          console.error('Failed to decode token');
          setIsLoading(false);
          return;
        }

        if (decodedToken.id !== undefined && decodedToken.id !== null) {
          localStorage.setItem('userId', String(decodedToken.id));
        }

        const user: UserData = {
          userId: decodedToken.id,
          fullname: decodedToken.fullname,
          email: decodedToken.email,
          phone_number: decodedToken.phone.phone_number,
          username: decodedToken.username,
          dob: decodedToken.dob,
          address: decodedToken.address
        };

        setUserData(user);
        setIsLoading(false);

      } catch (error) {
        console.error('Error loading user data from token:', error);
        setIsLoading(false);
      }
    };

    loadUserDataFromToken();
  }, []);

  // ✅ Load pets từ service
  useEffect(() => {
    const fetchPets = async () => {
      if (!userData?.userId) return;

      try {
        setLoadingPets(true);
        // ✅ Sử dụng service thay vì fetch trực tiếp
        const data = await getPetsByOwner(userData.userId);
        setPets(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching pets:', error);
        setPets([]);
      } finally {
        setLoadingPets(false);
      }
    };

    if (userData?.userId) {
      fetchPets();
    }
  }, [userData?.userId]);

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    setIsSettingsModalOpen(true);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push('/user/profile');
  };

  const handleLogoutClick = () => {
    logoutUser();
    setTimeout(() => {
      window.location.href = '/auth/login';
      if (window.history && window.history.length > 1) {
        window.history.forward();
      }
    }, 500);
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPetIcon = (species?: string) => {
    const icons: { [key: string]: string } = {
      'dog': '🐕', 'cat': '🐈', 'chó': '🐕', 'mèo': '🐈',
      'rabbit': '🐇', 'thỏ': '🐇', 'bird': '🐦', 'chim': '🐦',
    };
    return icons[species?.toLowerCase() || ''] || '🐾';
  };

  const handleSearchItemClick = (path: string) => {
    setIsSearchModalOpen(false);
    setSearchQuery('');
    router.push(path);
  };

  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <>
      <div className="w-64 bg-white border-r border-teal-100 flex flex-col shadow-sm">
        <div className="p-3 border-b border-teal-100 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-28 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-36 animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {userData ? getInitials(userData.fullname) : '🐾'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {userData?.fullname || 'My Pet Care'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {userData?.email?.email_address || 'user@example.com'}
                  </div>
                </div>
              </>
            )}
            <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-3 right-3 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button onClick={handleProfileClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Hồ sơ</span>
              </button>
              <button onClick={handleSettingsClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Cài đặt</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium text-red-600">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 mb-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-500 text-sm transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 group-hover:text-teal-600">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <span className="flex-1 text-left">Tìm kiếm...</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] font-medium text-gray-500 group-hover:border-teal-300">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <div className="space-y-6">
            {/* Tổng quan */}
            <div>
              <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Tổng quan</div>
              <Link href="/user/home">
                <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                  ${pathname === '/user/home'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                    : 'hover:bg-teal-50 text-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                  </svg>
                  <span>Trang chủ</span>
                </button>
              </Link>
            </div>

            {/* Thú cưng */}
            <div>
              <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Thú cưng của tôi</div>
              <div className="space-y-1">
                <Link href="/user/pet/list">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${pathname === '/user/pet/list'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                    </svg>
                    <span>Danh sách thú cưng</span>
                  </button>
                </Link>

                <Link href="/user/pet/new">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${pathname === '/user/pet/new'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    <span>Đăng ký thú cưng mới</span>
                  </button>
                </Link>
              </div>
            </div>

            <div>
              <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Cộng đồng</div>
              <div className="space-y-1">
                {/* Trang chủ cộng đồng */}
                <Link href="/user/community">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
        ${pathname === '/user/community'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                    </svg>
                    <span>Cộng đồng Pettopia</span>
                  </button>
                </Link>

                {/* Quản lý bài viết - MỚI */}
                <Link href="/user/community/manage">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
        ${pathname === '/user/community/manage'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 8a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zM4 9v6h12V9H4z" />
                      <path d="M7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                    </svg>
                    <span>Quản lý post</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Đặt lịch & Y tế */}
            <div>
              <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Đặt lịch & Y tế</div>
              <div className="space-y-1">
                <Link href="/user/appointments/booking">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${pathname === '/user/appointments/booking'
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                    </svg>
                    <span>Đặt lịch khám</span>
                  </button>
                </Link>

                <Link href="/user/appointments/list">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${pathname === '/user/appointments/list'
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M10.5 1.5H5.75A2.75 2.75 0 003 4.25v11A2.75 2.75 0 005.75 18h8.5A2.75 2.75 0 0117 15.25v-11A2.75 2.75 0 0014.25 1.5H10.5z" />
                    </svg>
                    <span>Xem lịch khám</span>
                  </button>
                </Link>

                <Link href="/user/prescription">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${pathname === '/user/prescription'
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm'
                      : 'hover:bg-teal-50 text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                    </svg>
                    <span>Lịch sử khám</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Thú cưng xem gần đây */}
            <div>
              <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Xem gần đây</div>
              <div className="space-y-1">
                {loadingPets ? (
                  <>
                    <div className="px-3 py-2"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></div></div>
                    <div className="px-3 py-2"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></div></div>
                  </>
                ) : pets.length > 0 ? (
                  <>
                    {pets.map((pet) => (
                      <Link key={pet.id} href={`/user/pet/${pet.id}`}>
                        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                          ${pathname === `/user/pet/${pet.id}`
                            ? 'bg-gradient-to-r from-teal-400 to-orange-500 text-white shadow-sm'
                            : 'hover:bg-teal-50 text-gray-700'}`}>
                          {pet.image || pet.imageUrl || pet.photo || pet.avatar_url ? (
                            <img src={pet.image || pet.imageUrl || pet.photo || pet.avatar_url} alt={pet.name} className="w-6 h-6 rounded-full object-cover border border-teal-200" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-orange-500 flex items-center justify-center text-xs">
                              {getPetIcon(pet.species || pet.type)}
                            </div>
                          )}
                          <span className="truncate">{pet.name}</span>
                        </button>
                      </Link>
                    ))}
                    {pets.length >= 5 && (
                      <Link href="/user/pet/list">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-teal-600 text-sm transition-colors font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                          </svg>
                          <span>Xem tất cả</span>
                        </button>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-4 text-center">
                    <div className="text-2xl mb-2">🐾</div>
                    <p className="text-xs text-gray-500 mb-2">Chưa có thú cưng</p>
                    <Link href="/user/pet/new">
                      <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">+ Thêm thú cưng</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-teal-100">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 hover:from-teal-100 hover:to-orange-100 text-teal-700 text-sm transition-colors border border-teal-200">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-blue-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="font-medium">Nâng cấp Premium</span>
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[600px] overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm chức năng..."
                  className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded">ESC</kbd>
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="overflow-y-auto max-h-[500px] p-2">
              {Object.keys(groupedMenuItems).length > 0 ? (
                Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchItemClick(item.path)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-teal-50 text-left transition-colors group"
                        >
                          <div className="text-teal-600 group-hover:text-teal-700">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Không tìm thấy kết quả phù hợp</p>
                  <p className="text-gray-400 text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                </div>
              )}
            </div>

            {/* Search Footer */}
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">↑</kbd>
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">↓</kbd>
                    <span>Di chuyển</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">↵</kbd>
                    <span>Chọn</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">ESC</kbd>
                  <span>Đóng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Account Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Thông báo Email</p>
                      <p className="text-sm text-gray-500">Nhận cập nhật về thú cưng của bạn</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Thông báo đẩy</p>
                      <p className="text-sm text-gray-500">Nhận thông báo trên thiết bị</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao diện</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Chế độ tối</p>
                      <p className="text-sm text-gray-500">Chuyển sang giao diện tối</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền riêng tư</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Hiển thị hồ sơ công khai</p>
                      <p className="text-sm text-gray-500">Cho phép người khác xem hồ sơ</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert('Đã lưu cài đặt!');
                  setIsSettingsModalOpen(false);
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}