import { useState, useEffect } from 'react';
import { parseJwt, isTokenExpired } from '../utils/jwt';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';  // Thêm import này

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

interface Pet {
  id: string | number;
  name: string;
  species?: string;
  type?: string;
  breed?: string;
  image?: string;
  imageUrl?: string;
  photo?: string;
  avatar_url?: string;
}

interface UserNavbarProps {
  setShowSearch: (v: boolean) => void;
  showSearch: boolean;
}

export default function UserNavbar({ setShowSearch, showSearch }: UserNavbarProps) {
  const pathname = usePathname();  // Thêm hook này
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

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
          localStorage.removeItem("authToken");
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
        const apiUrl = `http://localhost:3000/api/v1/pet/owner/${userData.userId}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Không thể tải danh sách thú cưng`);
        }

        const data = await response.json();
        const petsData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setPets(petsData.slice(0, 5));
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
    alert('Profile clicked');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem("authToken");
    router.replace('/auth/login');
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
              <button onClick={handleSettingsClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Cài đặt</span>
              </button>
              <button onClick={handleProfileClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Hồ sơ</span>
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
          <div className="space-y-1">
            <button onClick={() => setShowSearch(!showSearch)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <span>Tìm kiếm</span>
            </button>

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

            <Link href="/user/pet-list">
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                ${pathname === '/user/pet-list'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                  : 'hover:bg-teal-50 text-gray-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                </svg>
                <span>Danh sách thú cưng</span>
              </button>
            </Link>


            <Link href="/user/community/mainPage">
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                ${pathname === '/user/community/mainPage'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                  : 'hover:bg-teal-50 text-gray-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>Community</span>
              </button>
            </Link>

          </div>

          <div className="mt-6">
            <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Truy cập nhanh</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                </svg>
                <span>Nhật ký Pet</span>
              </button>

              <Link href="/user/user-booking">

                <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                ${pathname === '/user/user-booking'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                    : 'hover:bg-teal-50 text-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                  </svg>
                  <span>Lịch khám</span>
                </button>
              </Link>

              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                <span>Đơn thuốc</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Dịch vụ</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              <span>Thêm dịch vụ</span>
            </button>
          </div>

          <div className="mt-6">
            <div className="text-xs text-teal-600 font-semibold px-3 mb-2 uppercase tracking-wide">Thú cưng của tôi</div>
            <div className="space-y-1">
              {loadingPets ? (
                <>
                  <div className="px-3 py-2"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></div></div>
                  <div className="px-3 py-2"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></div></div>
                </>
              ) : pets.length > 0 ? (
                <>
                  {pets.map((pet) => (
                    <Link key={pet.id} href={`/user/user-pet/${pet.id}`}>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
                        {pet.image || pet.imageUrl || pet.photo || pet.avatar_url ? (
                          <img src={pet.image || pet.imageUrl || pet.photo || pet.avatar_url} alt={pet.name} className="w-6 h-6 rounded-full object-cover border border-teal-200" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
                            {getPetIcon(pet.species || pet.type)}
                          </div>
                        )}
                        <span className="truncate">{pet.name}</span>
                      </button>
                    </Link>
                  ))}
                  {pets.length >= 5 && (
                    <Link href="/user/pet-list">
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
                  <Link href="/user/register-pet">
                    <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">+ Thêm thú cưng</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-teal-100">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-700 text-sm transition-colors">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span>Nâng cấp Premium</span>
          </button>
        </div>
      </div >

      {/* Click outside to close dropdown */}
      {
        isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )
      }

      {/* Settings Modal */}
      {
        isSettingsModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your pets</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Get alerts on your device</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Dark Mode</p>
                        <p className="text-sm text-gray-500">Switch to dark theme</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-sm text-gray-500">Make profile public</p>
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
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Settings saved!');
                    setIsSettingsModalOpen(false);
                  }}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}