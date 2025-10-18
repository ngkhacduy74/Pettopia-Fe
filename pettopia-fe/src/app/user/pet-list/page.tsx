'use client'
import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Pet {
    id: string | number;
    name: string;
    species?: string;
    type?: string;
    breed?: string;
    birthDate?: string;
    dateOfBirth?: string;
    weight?: string | number;
    gender?: string;
    image?: string;
    imageUrl?: string;
    photo?: string;
    avatar_url?: string;
    status?: string;
    color?: string;
    owner?: string;
    ownerId?: string;
    lastCheckup?: string;
}

export default function PetListPage() {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [filterActor, setFilterActor] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

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

        if (id) {
            setUserId(id);
            fetchPets(id);
        }
    }, []);

    const fetchPets = async (uid: string) => {
        try {
            setLoading(true);
            const apiUrl = `http://localhost:3000/api/v1/pet/owner/${uid}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Không thể tải danh sách thú cưng (HTTP ${response.status})`);
            }

            const data = await response.json();
            const petsData = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
            setPets(petsData);
            setError(null);
        } catch (err) {
            setPets([]);
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            console.error('Error fetching pets:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-gray-500/20 text-gray-700 border-gray-500/30';

        const statusLower = status.toLowerCase();
        if (statusLower.includes('healthy') || statusLower.includes('active') || statusLower.includes('khỏe')) {
            return 'bg-green-500/20 text-green-700 border-green-500/30';
        }
        if (statusLower.includes('checkup') || statusLower.includes('kiểm tra')) {
            return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
        }
        if (statusLower.includes('treatment') || statusLower.includes('điều trị') || statusLower.includes('sick')) {
            return 'bg-red-500/20 text-red-700 border-red-500/30';
        }
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    };

    const getStatusText = (status?: string) => {
        if (!status) return 'Chưa rõ';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('healthy') || statusLower.includes('active')) return 'Khỏe mạnh';
        if (statusLower.includes('checkup')) return 'Cần kiểm tra';
        if (statusLower.includes('treatment') || statusLower.includes('sick')) return 'Đang điều trị';
        return status;
    };

    const getActorBadge = (petId: string | number) => {
        // Logic to determine actor - you can customize this based on your data
        return 'bg-green-500/20 text-green-700';
    };

    const getPetIcon = (species?: string) => {
        const icons: { [key: string]: string } = {
            'dog': '🐕',
            'cat': '🐈',
            'chó': '🐕',
            'mèo': '🐈',
            'rabbit': '🐇',
            'thỏ': '🐇',
            'bird': '🐦',
            'chim': '🐦',
        };
        return icons[species?.toLowerCase() || ''] || '🐾';
    };

    const getAgeText = (birthDate?: string) => {
        if (!birthDate) return 'Chưa rõ';
        const today = new Date();
        const birth = new Date(birthDate);
        const years = today.getFullYear() - birth.getFullYear();
        const months = today.getMonth() - birth.getMonth();

        if (years === 0) {
            return `${months} tháng tuổi`;
        }
        return `${years} tuổi`;
    };

    const filteredPets = pets.filter((pet) => {
        const statusMatch = filterStatus === 'all' || getStatusText(pet.status).includes(filterStatus);
        return statusMatch;
    });

    const handleViewDetails = (petId: string | number) => {
        router.push(`/user/user-pet/${petId}`);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white">
                <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải danh sách thú cưng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white">
                <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Có lỗi xảy ra</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={() => userId && fetchPets(userId)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 text-gray-900">Danh sách thú cưng</h1>
                                <p className="text-gray-600">Quản lý và theo dõi tất cả thú cưng của bạn ({pets.length} thú cưng)</p>
                            </div>
                            <Link href="/user/register-pet">
                                <button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    Thêm thú cưng mới
                                </button>
                            </Link>
                        </div>

                        {/* Simplified Filters */}
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === 'all'
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-teal-50'
                                        }`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setFilterStatus('Khỏe mạnh')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === 'Khỏe mạnh'
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-teal-50'
                                        }`}
                                >
                                    Khỏe mạnh
                                </button>
                                <button
                                    onClick={() => setFilterStatus('Cần kiểm tra')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === 'Cần kiểm tra'
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-teal-50'
                                        }`}
                                >
                                    Cần kiểm tra
                                </button>
                                <button
                                    onClick={() => setFilterStatus('Đang điều trị')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === 'Đang điều trị'
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-teal-50'
                                        }`}
                                >
                                    Đang điều trị
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Simplified Table Header */}
                    <div className="from bg-teal-600 to bg-gray-200 text-white rounded-t-xl px-6 py-4">

                        <div className="grid grid-cols-12 gap-4 items-center font-semibold">
                            <div className="col-span-3">Tên thú cưng</div>
                            <div className="col-span-2">Loài</div>
                            <div className="col-span-3">Ngày sinh</div>
                            <div className="col-span-2">Cân nặng</div>
                            <div className="col-span-2">Tình trạng</div>
                        </div>
                    </div>

                    {/* Simplified Pet List */}
                    <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
                        {filteredPets.map((pet, index) => (
                            <div
                                key={pet.id}
                                onClick={() => handleViewDetails(pet.id)}
                                className={`grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-teal-50 transition-colors cursor-pointer ${index !== filteredPets.length - 1 ? 'border-b border-gray-200' : ''
                                    }`}
                            >
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <img
                                            src={pet.avatar_url || pet.imageUrl || pet.image || pet.photo || '/sampleimg/default-pet.jpg'}
                                            alt={pet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="font-semibold text-gray-900">{pet.name}</div>
                                </div>

                                <div className="col-span-2 text-gray-700">
                                    {pet.species || pet.type || 'Chưa rõ'}
                                </div>

                                <div className="col-span-3 text-gray-700">
                                    {(pet.birthDate || pet.dateOfBirth)
                                        ? new Date(pet.birthDate || pet.dateOfBirth!).toLocaleDateString('vi-VN')
                                        : 'Chưa rõ'}
                                </div>

                                <div className="col-span-2 text-gray-700">
                                    {pet.weight ? `${pet.weight} kg` : 'Chưa rõ'}
                                </div>

                                <div className="col-span-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(pet.status)}`}>
                                        {getStatusText(pet.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}