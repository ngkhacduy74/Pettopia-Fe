'use client'
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import { createPet } from '@/services/petService';

export default function RegisterPetPage() {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);
    const [petForm, setPetForm] = useState({
        name: '',
        species: '',
        breed: '',
        gender: '',
        color: '',
        weight: '',
        dateOfBirth: '',
        avatar_url: '',
        city: '',
        district: '',
        ward: ''
    });

    // Add useState for user data
    const [userData, setUserData] = useState({
        user_id: '',
        fullname: '',
        phone: '',
        email: '',
        address: {
            city: '',
            district: '',
            ward: ''
        }
    });

    const handleInputChange = (field: string, value: string) => {
        setPetForm(prev => ({ ...prev, [field]: value }));
    };

    // Calculate age from date of birth
    const calculateAge = () => {
        if (!petForm.dateOfBirth) return 0;
        const today = new Date();
        const birthDate = new Date(petForm.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmitPet = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!petForm.name || !petForm.species) {
            setServerError('Vui lòng nhập tên và loại thú cưng');
            return;
        }

        setIsSubmitting(true);
        try {
            const normalizedSpecies = (() => {
                const map: Record<string, string> = {
                    'Chó': 'Dog', 'Mèo': 'Cat', 'Thỏ': 'Rabbit', 'Chim': 'Bird', 'Khác': 'Other'
                };
                return map[petForm.species] || petForm.species;
            })();

            const payload = {
                name: petForm.name,
                species: normalizedSpecies,
                breed: petForm.breed || undefined,
                gender: petForm.gender ? (petForm.gender === 'male' ? 'Male' : 'Female') : undefined,
                color: petForm.color || undefined,
                weight: petForm.weight ? Number(petForm.weight) : undefined,
                dateOfBirth: petForm.dateOfBirth ? new Date(petForm.dateOfBirth).toISOString() : undefined,
                avatar_url: petForm.avatar_url || undefined,
                // Many backends expect user_id at top-level instead of an owner object
                user_id: userData.user_id
            };

            const res = await createPet(payload);

            alert(res?.message || 'Tạo thú cưng thành công');
            router.push('/user/home');
        } catch (err: any) {
            if (typeof window !== 'undefined') {
                console.error('Create pet error:', err?.response || err);
            }
            setServerError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo thú cưng');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Trong RegisterPetPage
    useEffect(() => {
        const parseJwt = (token: string | null) => {
            if (!token) return null;
            try {
                const payload = token.split('.')[1];
                const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                return decoded;
            } catch (e) {
                console.error('Failed to parse JWT', e);
                return null;
            }
        };

        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("authToken");
                let userId = localStorage.getItem("userId");

                // Nếu không có userId, thử lấy từ token (các tên trường khả dĩ)
                if (!userId && token) {
                    const decoded = parseJwt(token);
                    const resolvedId = decoded?.userId ?? decoded?.id ?? decoded?.sub ?? null;
                    if (resolvedId) {
                        userId = String(resolvedId);
                        localStorage.setItem("userId", userId);
                    }
                }

                if (!token || !userId) {
                    console.warn('Missing auth token or userId, redirecting to login');
                    // tuỳ xử lý: redirect về login hoặc return
                    // router.push('/login');
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/v1/customer/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        user_id: userId,
                        fullname: data.fullname || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        address: {
                            city: data.address?.city || '',
                            district: data.address?.district || '',
                            ward: data.address?.ward || ''
                        }
                    });

                    setPetForm(prev => ({
                        ...prev,
                        city: data.address?.city || '',
                        district: data.address?.district || '',
                        ward: data.address?.ward || ''
                    }));
                } else {
                    console.error('Fetch user data failed', response.status);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-teal-50 to-white">
                <div className="max-w-7xl mx-auto px-11 py-8">
                    {/* Hero Section */}
                    <div className="mb-6">
                        <Link href="/user/pet-list" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Quay lại trang chủ</span>
                        </Link>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmitPet} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 text-white">
                            <h2 className="text-xl font-bold">Thông tin đăng kí thú cưng</h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Cột trái - Form nhập liệu */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="pet-name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên thú cưng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="pet-name"
                                            type="text"
                                            placeholder="VD: Milu, Cún..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pet-type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại thú cưng <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="pet-type"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.species}
                                            onChange={(e) => handleInputChange('species', e.target.value)}
                                            required
                                        >
                                            <option value="">Chọn loại</option>
                                            <option value="Dog">Chó</option>
                                            <option value="Cat">Mèo</option>
                                            <option value="Rabbit">Thỏ</option>
                                            <option value="Bird">Chim</option>
                                            <option value="Other">Khác</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="pet-breed" className="block text-sm font-medium text-gray-700 mb-1">
                                            Giống
                                        </label>
                                        <input
                                            id="pet-breed"
                                            type="text"
                                            placeholder="VD: Golden Retriever..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.breed}
                                            onChange={(e) => handleInputChange('breed', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pet-color" className="block text-sm font-medium text-gray-700 mb-1">
                                            Màu sắc
                                        </label>
                                        <input
                                            id="pet-color"
                                            type="text"
                                            placeholder="VD: Vàng nâu..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.color}
                                            onChange={(e) => handleInputChange('color', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Cột phải - Form nhập liệu */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="pet-weight" className="block text-sm font-medium text-gray-700 mb-1">
                                            Cân nặng (kg)
                                        </label>
                                        <input
                                            id="pet-weight"
                                            type="number"
                                            step="0.1"
                                            placeholder="VD: 12.5"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.weight}
                                            onChange={(e) => handleInputChange('weight', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pet-gender" className="block text-sm font-medium text-gray-700 mb-1">
                                            Giới tính
                                        </label>
                                        <select
                                            id="pet-gender"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="male">Đực</option>
                                            <option value="female">Cái</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="pet-dob" className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày sinh
                                        </label>
                                        <input
                                            id="pet-dob"
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.dateOfBirth}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pet-avatar" className="block text-sm font-medium text-gray-700 mb-1">
                                            Ảnh đại diện (URL)
                                        </label>
                                        <input
                                            id="pet-avatar"
                                            type="url"
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={petForm.avatar_url}
                                            onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                                        />
                                    </div>

                                    {/* Địa chỉ */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Địa chỉ</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="addr-city" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Thành phố
                                                </label>
                                                <input
                                                    id="addr-city"
                                                    type="text"
                                                    placeholder="VD: Hà Nội"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                                    value={petForm.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="addr-district" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quận/Huyện
                                                </label>
                                                <input
                                                    id="addr-district"
                                                    type="text"
                                                    placeholder="VD: Cầu Giấy"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                                    value={petForm.district}
                                                    onChange={(e) => handleInputChange('district', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="addr-ward" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phường/Xã
                                                </label>
                                                <input
                                                    id="addr-ward"
                                                    type="text"
                                                    placeholder="VD: Dịch Vọng"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                                    value={petForm.ward}
                                                    onChange={(e) => handleInputChange('ward', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Kết thúc grid hai cột */}
                            </div>

                            {/* Preview thẻ căn cước - Đặt cuối cùng */}
                            <div className="mt-10 flex flex-col items-center">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Xem trước thẻ căn cước</h3>
                                <div className="perspective-1000">
                                    <div
                                        className="relative cursor-pointer"
                                        style={{ width: '500px', height: '320px' }}
                                        onClick={() => setIsFlipped(!isFlipped)}
                                    >
                                        <motion.div
                                            className="w-full h-full"
                                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                                            transition={{ duration: 0.6 }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            <div
                                                className="absolute backface-hidden"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    width: '500px',
                                                    height: '320px'
                                                }}
                                            >
                                                <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-2xl p-6 h-full text-gray-800 overflow-hidden border-2 border-gray-400">
                                                    <div className="absolute inset-0 opacity-5">
                                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                            <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                <circle cx="10" cy="10" r="2" fill="currentColor" />
                                                            </pattern>
                                                            <rect width="100" height="100" fill="url(#pattern)" />
                                                        </svg>
                                                    </div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-gray-300 rounded mr-2"></div>
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-gray-900">PETTOPIA</h3>
                                                                    <p className="text-xs text-gray-700">Pet Identity Card</p>
                                                                </div>
                                                            </div>
                                                            <div className="bg-white rounded-lg px-2 py-1 border border-gray-400">
                                                                <p className="text-xs text-gray-700">
                                                                    ID: {'SAMPLE-' + Math.random().toString(36).substring(2, 6).toUpperCase()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-gray-400 overflow-hidden">
                                                                {petForm.avatar_url ? (
                                                                    <img
                                                                        src={petForm.avatar_url}
                                                                        alt="Pet"
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                            if (sibling) sibling.style.display = 'block';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <svg
                                                                    className="w-12 h-12 text-gray-600"
                                                                    style={{ display: petForm.avatar_url ? 'none' : 'block' }}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                </svg>
                                                            </div>

                                                            <div className="flex-1">
                                                                <h4 className="text-2xl font-bold mb-3 text-gray-900">
                                                                    {petForm.name || 'Tên thú cưng'}
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <p className="text-gray-700">Loài:</p>
                                                                        <p className="font-semibold text-gray-900">{petForm.species || '---'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-700">Màu lông:</p>
                                                                        <p className="font-semibold text-gray-900">{petForm.color || '---'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-700">Giới tính:</p>
                                                                        <p className="font-semibold text-gray-900">
                                                                            {petForm.gender === 'male' ? 'Đực' : petForm.gender === 'female' ? 'Cái' : '---'}
                                                                        </p>
                                                                    </div>
                                                                 
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t-2 border-gray-400">
                                                            <p className="text-xs text-gray-700 text-center">Click để xem mặt sau</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Back of card */}
                                            <div
                                                className="absolute backface-hidden"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)',
                                                    width: '500px',
                                                    height: '320px'
                                                }}
                                            >
                                                <div className="relative bg-gradient-to-br from-gray-300 to-gray-200 rounded-2xl shadow-2xl p-6 h-full text-gray-800 overflow-hidden border-2 border-gray-400">
                                                    <div className="absolute inset-0 opacity-5">
                                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                            <pattern id="pattern2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                <circle cx="10" cy="10" r="2" fill="currentColor" />
                                                            </pattern>
                                                            <rect width="100" height="100" fill="url(#pattern2)" />
                                                        </svg>
                                                    </div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-center mb-4">
                                                            <div className="w-8 h-8 bg-gray-300 rounded mr-2"></div>
                                                            <h3 className="text-lg font-bold text-gray-900">Thông tin chi tiết</h3>
                                                        </div>

                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                                <span className="text-gray-700">Giống:</span>
                                                                <span className="font-semibold text-gray-900">{petForm.breed || '---'}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                                <span className="text-gray-700">Cân nặng:</span>
                                                                <span className="font-semibold text-gray-900">{petForm.weight ? `${petForm.weight} kg` : '---'}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                                <span className="text-gray-700">Ngày sinh:</span>
                                                                <span className="font-semibold text-gray-900">
                                                                    {petForm.dateOfBirth ? new Date(petForm.dateOfBirth).toLocaleDateString('vi-VN') : '---'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                                <span className="text-gray-700">Thành phố:</span>
                                                                <span className="font-semibold text-gray-900">{petForm.city || '---'}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                                <span className="text-gray-700">Quận/Huyện:</span>
                                                                <span className="font-semibold text-gray-900">{petForm.district || '---'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-700">Phường/Xã:</span>
                                                                <span className="font-semibold text-gray-900">{petForm.ward || '---'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t-2 border-gray-400">
                                                            <p className="text-xs text-gray-700 text-center">Click để xem mặt trước</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {serverError && (
                                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                                    {serverError}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                                <Link href="/" className="flex-1">
                                    <button
                                        type="button"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                                    >
                                        Hủy bỏ
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-all font-medium ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                                        }`}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Đăng ký thú cưng'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>


            </div>
            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowSearch(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-teal-100">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="flex-1 bg-transparent outline-none text-gray-900"
                                    autoFocus
                                />
                                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-left transition-colors">
                                <span className="text-gray-700">Hồ sơ Pet</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-left transition-colors">
                                <span className="text-gray-700">Community</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-50 text-left transition-colors">
                                <span className="text-gray-700">Nhật ký Pet</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}