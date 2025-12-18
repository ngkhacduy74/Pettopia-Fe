'use client'

import { useState, useEffect, useRef, JSX } from 'react';
import { parseJwt, isTokenExpired } from '@/utils/jwt';
import { logoutUser } from '@/services/auth/authService';
import { getVipStatus } from '@/services/user/userService';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getPetsByOwner, type PetDetailResponse } from '@/services/petcare/petService';
import SearchModal, { type MenuItem } from '@/components/layout/SearchModal';
import { Pacifico } from 'next/font/google';
import { toast } from 'react-hot-toast';

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
});

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

export default function UserNavbar({ setShowSearch, showSearch }: UserNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [vipLoading, setVipLoading] = useState(false);


  interface MenuItem {
    id: string;
    name: string;
    icon: JSX.Element;
    path: string;
    category: string;
    keywords: string[];
  }

  const menuItems: MenuItem[] = [
    {
      id: 'list',
      name: 'Danh sách thú cưng',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5"><circle cx="6" cy="7" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="4" cy="12" r="2.2"/><circle cx="20" cy="12" r="2.2"/><ellipse cx="12" cy="19" rx="3" ry="4"/></svg>,
      path: '/user/pet/list',
      category: 'Thú cưng',
      keywords: ['thú cưng', 'pet', 'danh sách', 'list', 'quản lý pet']
    },
    {
      id: 'register-pet',
      name: 'Đăng ký thú cưng mới',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
      path: '/user/pet/new',
      category: 'Thú cưng',
      keywords: ['đăng ký', 'thêm', 'register', 'add', 'pet mới', 'thú cưng mới']
    },
    {
      id: 'community',
      name: 'Cộng đồng Pettopia',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      path: '/user/community',
      category: 'Cộng đồng',
      keywords: ['cộng đồng', 'community', 'pettopia', 'social', 'bạn bè']
    },
    {
      id: 'manage',
      name: 'Quản lý bài viết',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/></svg>,
      path: '/user/community/manage',
      category: 'Cộng đồng',
      keywords: ['quản lý', 'bài viết', 'post', 'manage', 'nội dung', 'content']
    },
    {
      id: 'booking',
      name: 'Đặt lịch khám',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      path: '/user/appointments/booking',
      category: 'Đặt lịch',
      keywords: ['lịch khám', 'booking', 'appointment', 'đặt lịch', 'khám bệnh', 'veterinary', 'bác sĩ thú y']
    },
    {
      id: 'view-appointments',
      name: 'Xem lịch khám',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14l2 2 4-4"/></svg>,
      path: '/user/appointments/list',
      category: 'Đặt lịch',
      keywords: ['xem', 'lịch khám', 'appointments', 'lịch hẹn', 'quản lý', 'lịch sử']
    },
    {
      id: 'prescription',
      name: 'Lịch sử khám',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2.5"/></svg>,
      path: '/user/prescription',
      category: 'Đặt lịch',
      keywords: ['lịch sử', 'prescription', 'medicine', 'thuốc', 'y tế']
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  useEffect(() => {
    const fetchPets = async () => {
      if (!userData?.userId) return;

      try {
        setLoadingPets(true);
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

  useEffect(() => {
    const fetchVipStatus = async () => {
      try {
        setVipLoading(true);
        const vipData = await getVipStatus();
        if (vipData && vipData.is_vip) {
          setIsVip(true);
        }
      } catch (error) {
        console.error('Error fetching VIP status:', error);
        setIsVip(false);
      } finally {
        setVipLoading(false);
      }
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      fetchVipStatus();
    }
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false);
    setIsSettingsModalOpen(true);
  };

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    router.push('/user/profile');
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    logoutUser();
    setTimeout(() => {
      window.location.href = '/auth/login';
      if (window.history && window.history.length > 1) {
        window.history.forward();
      }
    }, 500);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 overflow-visible`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex flex-col gap-2">
          {!isSidebarCollapsed && (
            <>
              {/* When sidebar is open */}
              <div className="flex items-center justify-between gap-2">
                {/* Logo and text on the left */}
                <Link href="/user/home">
                  <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src="/sampleimg/logo.png" alt="Pettopia Logo" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`${pacifico.className} text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent truncate`}>
                        Pettopia
                      </span>
                      {isVip && (
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">PREMIUM</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Search button in the middle */}
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Tìm kiếm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 text-gray-600 hover:text-teal-600">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Collapse button on the right */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title={isSidebarCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>
            </>
          )}

          {isSidebarCollapsed && (
            <>
              {/* When sidebar is collapsed */}
              <div className="flex items-center justify-center">
                <Link href="/user/home">
                  <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center">
                    <img src="/sampleimg/logo.png" alt="Pettopia Logo" className="w-8 h-8" />
                  </div>
                </Link>
              </div>

              {/* Collapse button below logo */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 w-full flex justify-center"
                title={isSidebarCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>

              {/* Search button below collapse button */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 w-full flex justify-center"
                title="Tìm kiếm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 text-gray-600 hover:text-teal-600">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-visible">
          <div className={`${isSidebarCollapsed ? 'px-2 py-4 space-y-2' : 'space-y-4 px-2 py-4'} overflow-y-auto max-h-full overflow-x-visible`}>
            {/* Thú cưng Section */}
            <div>
              {!isSidebarCollapsed && <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Thú cưng</div>}
              {isSidebarCollapsed && <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent mx-2 mb-2"></div>}
              <div className="space-y-1">
                <Link href="/user/pet/list">
                  <div className="relative overflow-visible">
                    <button
                      className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${pathname === '/user/pet/list'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🐾
                      {!isSidebarCollapsed && <span>Danh sách thú cưng</span>}
                    </button>
                  </div>
                </Link>

                <Link href="/user/pet/new">
                  <div className="relative overflow-visible">
                    <button className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${pathname === '/user/pet/new'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 flex-shrink-0"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                      {!isSidebarCollapsed && <span>Đăng ký thú cưng mới</span>}
                    </button>
                  </div>
                </Link>
              </div>
            </div>

            {/* Cộng đồng Section */}
            <div>
              {!isSidebarCollapsed && <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Cộng đồng</div>}
              {isSidebarCollapsed && <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent mx-2 mb-2"></div>}
              <div className="space-y-1">
                <Link href="/user/community">
                  <div className="relative overflow-visible">
                    <button className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${pathname === '/user/community'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 flex-shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {!isSidebarCollapsed && <span>Cộng đồng Pettopia</span>}
                    </button>
                  </div>
                </Link>

                <Link href="/user/community/manage">
                  <div className="relative">
                    <button className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${pathname === '/user/community/manage'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 flex-shrink-0"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                      {!isSidebarCollapsed && <span>Quản lý bài viết</span>}
                    </button>
                  </div>
                </Link>
              </div>
            </div>

            {/* Đặt lịch & Y tế Section */}
            <div>
              {!isSidebarCollapsed && <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Đặt lịch & Y tế</div>}
              {isSidebarCollapsed && <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent mx-2 mb-2"></div>}
              <div className="space-y-1">
                <Link href="/user/appointments/booking">
                  <div className="relative">
                    <button className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${pathname === '/user/appointments/booking'
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 flex-shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {!isSidebarCollapsed && <span>Đặt lịch khám</span>}
                    </button>
                  </div>
                </Link>

                <Link href="/user/appointments/list">
                  <div className="relative">
                    <button className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${pathname === '/user/appointments/list'
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 flex-shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14l2 2 4-4"/></svg>
                      {!isSidebarCollapsed && <span>Xem lịch khám</span>}
                    </button>
                  </div>
                </Link>

                <Link href="/user/prescription">
                  <div className="relative">
                    <button className={`w-full flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'} gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${pathname === '/user/prescription'
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 flex-shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2.5"/></svg>
                      {!isSidebarCollapsed && <span>Lịch sử khám</span>}
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-3 space-y-2">

          {/* User Profile Button */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors`}
            >
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {userData ? getInitials(userData.fullname) : '🐾'}
                </div>
              )}
              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {userData?.fullname || 'User'}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {/* User Menu */}
            {isUserMenuOpen && (
              <div className={`absolute ${isSidebarCollapsed ? 'left-full ml-2 bottom-0' : 'left-4 right-4 bottom-16'} bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-50 w-48`}>
                <button onClick={handleProfileClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left">
                  <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Hồ sơ</span>
                </button>
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/user/change-password');
                  }} 
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Đổi mật khẩu</span>
                </button>
                <button onClick={handleSettingsClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left">
                  <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Cài đặt</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium text-red-600">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

          {/* Upgrade Button */}
          {!isSidebarCollapsed && (
            <button
              onClick={() => !isVip && router.push('/user/upgrade')}
              disabled={isVip}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border font-medium ${
                isVip
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 text-teal-700 border-teal-300 cursor-pointer'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>{isVip ? 'Premium' : 'Nâng cấp'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Cài đặt - tính năng đang phát triển</h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Thông báo Email</p>
                      <p className="text-sm text-gray-500">Nhận cập nhật về thú cưng của bạn</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" onChange={() => toast('Chức năng này đang phát triển', { duration: 2000, position: 'top-right' })} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Thông báo đẩy</p>
                      <p className="text-sm text-gray-500">Nhận thông báo trên thiết bị</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-teal-600" onChange={() => toast('Chức năng này đang phát triển', { duration: 2000, position: 'top-right' })} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao diện</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Chế độ tối</p>
                      <p className="text-sm text-gray-500">Chuyển sang giao diện tối</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-teal-600" onChange={() => toast('Chức năng này đang phát triển', { duration: 2000, position: 'top-right' })} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền riêng tư</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Hiển thị hồ sơ công khai</p>
                      <p className="text-sm text-gray-500">Cho phép người khác xem hồ sơ</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" onChange={() => toast('Chức năng này đang phát triển', { duration: 2000, position: 'top-right' })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  toast('Chức năng này đang phát triển', { duration: 3000, position: 'top-right' });
                  setTimeout(() => {
                    setIsSettingsModalOpen(false);
                  }, 3000);
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        menuItems={menuItems}
      />
    </>
  );
}
