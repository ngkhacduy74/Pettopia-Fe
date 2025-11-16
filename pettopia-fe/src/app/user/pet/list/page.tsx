'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deletePet } from '@/services/petcare/petService';

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
    const [filterStatus, setFilterStatus] = useState<'all' | 'Khỏe mạnh' | 'Cần kiểm tra' | 'Đang điều trị'>('all');
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
                headers: { 'Accept': 'application/json' },
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
        const s = status.toLowerCase();
        if (s.includes('healthy') || s.includes('khỏe')) return 'bg-green-500/20 text-green-700 border-green-500/30';
        if (s.includes('checkup') || s.includes('kiểm tra')) return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
        if (s.includes('treatment') || s.includes('điều trị') || s.includes('sick')) return 'bg-red-500/20 text-red-700 border-red-500/30';
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    };

    const getStatusText = (status?: string) => {
        if (!status) return 'Chưa rõ';
        const s = status.toLowerCase();
        if (s.includes('healthy') || s.includes('active')) return 'Khỏe mạnh';
        if (s.includes('checkup')) return 'Cần kiểm tra';
        if (s.includes('treatment') || s.includes('sick')) return 'Đang điều trị';
        return status;
    };

    const filteredPets = pets.filter((pet) => {
        if (filterStatus === 'all') return true;
        return getStatusText(pet.status) === filterStatus;
    });

    const handleViewDetails = (petId: string | number) => {
        router.push(`/user/pet/${petId}`);
    };

    const handleEditPet = (petId: string | number) => {
        router.push(`/user/pet/edit/${petId}`);
    };

    const handleDeleteClick = (pet: Pet, e: React.MouseEvent) => {
        e.stopPropagation();
        setPetToDelete(pet);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!petToDelete) return;
        setIsDeleting(true);
        try {
            await deletePet(String(petToDelete.id));
            setPets(prev => prev.filter(p => p.id !== petToDelete.id));
            setDeleteModalOpen(false);
            setPetToDelete(null);
            alert('Xóa thú cưng thành công!');
        } catch (error: any) {
            console.error('Delete pet error:', error);
            alert('Có lỗi xảy ra khi xóa thú cưng: ' + (error?.response?.data?.message || error.message));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setPetToDelete(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách thú cưng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Có lỗi xảy ra</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button onClick={() => userId && fetchPets(userId)} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 text-gray-900">Danh sách thú cưng</h1>
                            <p className="text-gray-600">Quản lý và theo dõi tất cả thú cưng của bạn ({pets.length} thú cưng)</p>
                        </div>
                        <Link href="/user/pet/new">
                            <button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                                Thêm thú cưng mới
                            </button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 items-center mb-6">
                        <div className="flex gap-2">
                            {['all', 'Khỏe mạnh', 'Cần kiểm tra', 'Đang điều trị'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status as any)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        filterStatus === status
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-teal-50'
                                    }`}
                                >
                                    {status === 'all' ? 'Tất cả' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pet List - SAME STYLE AS POST LIST */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header - IDENTICAL TO POST LIST */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200 px-6 py-3">
                        <div className="grid grid-cols-12 gap-6 text-xs font-bold text-teal-700 uppercase tracking-wider">
                            <div className="col-span-3">Tên thú cưng</div>
                            <div className="col-span-2">Loài</div>
                            <div className="col-span-2">Ngày sinh</div>
                            <div className="col-span-2">Cân nặng</div>
                            <div className="col-span-2">Tình trạng</div>
                            <div className="col-span-1 text-right pr-2"></div>
                        </div>
                    </div>

                    {/* List Body */}
                    <div className="divide-y divide-gray-100">
                        {filteredPets.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                Không có thú cưng nào
                            </div>
                        ) : (
                            filteredPets.map((pet) => (
                                <div
                                    key={pet.id}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <div className="grid grid-cols-12 gap-6 items-center px-6 py-4">
                                        {/* Name + Avatar */}
                                        <div
                                            className="col-span-3 flex items-center gap-3 cursor-pointer"
                                            onClick={() => handleViewDetails(pet.id)}
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                                <img
                                                    src={pet.avatar_url || pet.imageUrl || pet.image || pet.photo || '/sampleimg/default-pet.jpg'}
                                                    alt={pet.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.src = '/sampleimg/default-pet.jpg'; }}
                                                />
                                            </div>
                                            <div className="font-semibold text-gray-900 truncate">{pet.name}</div>
                                        </div>

                                        {/* Species */}
                                        <div className="col-span-2 text-gray-700">
                                            {(pet.species || pet.type) || 'Chưa rõ'}
                                        </div>

                                        {/* Birth Date */}
                                        <div className="col-span-2 text-gray-700">
                                            {(pet.birthDate || pet.dateOfBirth)
                                                ? new Date(pet.birthDate || pet.dateOfBirth!).toLocaleDateString('vi-VN')
                                                : 'Chưa rõ'}
                                        </div>

                                        {/* Weight */}
                                        <div className="col-span-2 text-gray-700">
                                            {pet.weight ? `${pet.weight} kg` : 'Chưa rõ'}
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(pet.status)}`}>
                                                {getStatusText(pet.status)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 flex gap-1 justify-end">
                                            <button
                                                onClick={() => handleEditPet(pet.id)}
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(pet, e)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Modal - Giữ nguyên */}
            {deleteModalOpen && petToDelete && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={handleDeleteCancel}>
                    <div
                        className="rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-scaleIn relative"
                        style={{
                            backgroundImage: 'url(/sampleimg/bg-green.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            minHeight: '500px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(() => {
                            const p = petToDelete;
                            return (
                                <>
                                    <div className="bg-gradient-to-r from-teal-500 to-green-600 p-6 text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">Xác nhận xóa thú cưng</h3>
                                                <p className="text-green-100 text-sm mt-1">Hành động này không thể hoàn tác</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 p-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-gray-200 shadow-lg">
                                                    <img
                                                        src={p.avatar_url || p.imageUrl || p.image || p.photo || '/sampleimg/default-pet.jpg'}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.currentTarget.src = '/sampleimg/default-pet.jpg'; }}
                                                    />
                                                </div>
                                                <h4 className="text-2xl font-bold text-gray-900 mt-4">{p.name}</h4>
                                            </div>

                                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                                <div className="flex gap-3">
                                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-green-800">Bạn có chắc chắn muốn xóa thú cưng này?</p>
                                                        <p className="text-xs text-green-700 mt-1">Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <button
                                                    onClick={handleDeleteConfirm}
                                                    disabled={isDeleting}
                                                    className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-xl hover:from-teal-600 hover:to-green-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                            Đang xóa...
                                                        </>
                                                    ) : (
                                                        'Xác nhận xóa'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleDeleteCancel}
                                                    disabled={isDeleting}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium"
                                                >
                                                    Hủy bỏ
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <h5 className="text-lg font-bold text-gray-900 mb-4">Thông tin thú cưng</h5>
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                                                <span className="text-gray-600">Loại:</span>
                                                <span className="font-semibold text-gray-900">{(p.species || p.type) || '---'}</span>
                                            </div>
                                            {p.breed && (
                                                <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                                                    <span className="text-gray-600">Giống:</span>
                                                    <span className="font-semibold text-gray-900">{p.breed}</span>
                                                </div>
                                            )}
                                            {p.gender && (
                                                <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                                                    <span className="text-gray-600">Giới tính:</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {p.gender === 'Male' ? 'Đực' : p.gender === 'Female' ? 'Cái' : p.gender}
                                                    </span>
                                                </div>
                                            )}
                                            {p.color && (
                                                <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                                                    <span className="text-gray-600">Màu lông:</span>
                                                    <span className="font-semibold text-gray-900">{p.color}</span>
                                                </div>
                                            )}
                                            {p.weight && (
                                                <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                                                    <span className="text-gray-600">Cân nặng:</span>
                                                    <span className="font-semibold text-gray-900">{p.weight} kg</span>
                                                </div>
                                            )}
                                            {(p.birthDate || p.dateOfBirth) && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Ngày sinh:</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {new Date(p.birthDate || p.dateOfBirth!).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
            `}</style>
        </>
    );
}