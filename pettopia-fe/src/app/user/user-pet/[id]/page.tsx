'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';

interface OwnerAddress {
    city: string;
    district: string;
    ward: string;
}

interface OwnerInfo {
    user_id: string;
    fullname: string;
    phone: string;
    email: string;
    address: OwnerAddress;
}

interface PetDetail {
    id: string;
    name: string;
    species: string;
    gender?: string;
    breed?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    owner?: OwnerInfo;
}

export default function PetDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pet, setPet] = useState<PetDetail | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        async function loadPet() {
            if (!params?.id) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/v1/pet/${encodeURIComponent(params.id)}`, {
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal,
                });
                if (!res.ok) {
                    const body = await res.text().catch(() => '');
                    // eslint-disable-next-line no-console
                    console.error('Load pet failed', { status: res.status, body });
                    throw new Error(`Không thể tải thông tin thú cưng (HTTP ${res.status})`);
                }
                const data = await res.json();
                // Some APIs wrap content under data
                const normalized: PetDetail = data?.data ?? data;
                setPet(normalized);
            } catch (e: any) {
                if (e?.name === 'AbortError') return;
                setError(e?.message || 'Có lỗi xảy ra');
            } finally {
                setLoading(false);
            }
        }
        loadPet();
        return () => controller.abort();
    }, [params?.id]);

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors mb-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Quay lại</span>
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Thông tin thú cưng</h1>

                    {loading && (
                        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 text-center">
                            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-600">Đang tải...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-red-900 mb-2">Có lỗi xảy ra</h3>
                            <p className="text-red-700 mb-4">{error}</p>
                            <button
                                onClick={() => router.refresh()}
                                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {pet && !loading && !error && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-600">ID:</span><span className="font-medium">{pet.id}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Tên:</span><span className="font-medium">{pet.name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Loài:</span><span className="font-medium">{pet.species}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Giống:</span><span className="font-medium">{pet.breed || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Giới tính:</span><span className="font-medium">{pet.gender || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Màu sắc:</span><span className="font-medium">{pet.color || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Cân nặng:</span><span className="font-medium">{pet.weight ?? '---'}{pet.weight != null ? ' kg' : ''}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Ngày sinh:</span><span className="font-medium">{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('vi-VN') : '---'}</span></div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Chủ sở hữu</h3>
                                    <div className="flex justify-between"><span className="text-gray-600">User ID:</span><span className="font-medium">{pet.owner?.user_id || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Họ tên:</span><span className="font-medium">{pet.owner?.fullname || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Điện thoại:</span><span className="font-medium">{pet.owner?.phone || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-medium text-sm">{pet.owner?.email || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Thành phố:</span><span className="font-medium">{pet.owner?.address?.city || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Quận/Huyện:</span><span className="font-medium">{pet.owner?.address?.district || '---'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Phường/Xã:</span><span className="font-medium">{pet.owner?.address?.ward || '---'}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


