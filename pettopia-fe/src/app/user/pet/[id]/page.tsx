'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import UpcomingMeetings from '@/components/UpcomingMeetings';

interface Owner {
  user_id: string;
  fullname: string;
  phone?: string;
  email?: string;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
  };
}

interface MedicalRecord {
  record_id?: string;
  last_visit_date?: string;
  diagnoses?: string;
  treatment?: Array<{ medicine?: string; dosage?: string; frequency?: string; duration?: string }>;
  notes?: string;
}

interface Pet {
  id: string;
  name: string;
  species?: string;
  gender?: string;
  breed?: string;
  color?: string;
  weight?: number;
  dateOfBirth?: string;
  age?: number;
  avatar_url?: string;
  owner?: Owner;
  medical_record?: MedicalRecord;
}

export default function UserPetPage() {
    const params = useParams();
    const router = useRouter();
    const petId = params?.id;
    const [isFlipped, setIsFlipped] = useState(false);
    const [showPetDetails, setShowPetDetails] = useState(false);
    
    const servicesRef = useRef(null);
    const isInView = useInView(servicesRef, { once: true, amount: 0.3 });
    const [showCustomerId, setShowCustomerId] = useState(false);

    const [petData, setPetData] = useState<Pet | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mock data tạm thời cho "Tính năng quản lý"
    const mockFeatures = [
        {
            id: 'log',
            title: 'Nhật ký thú cưng',
            description: 'Ghi chép những khoảnh khắc đáng nhớ, hoạt động hàng ngày và những điều đặc biệt về thú cưng của bạn.',
            bullets: [
                'Theo dõi hoạt động hàng ngày',
                'Ghi chú thói quen ăn uống',
                'Lưu trữ kỷ niệm đặc biệt'
            ],
            actionText: 'Xem nhật ký'
        },
        {
            id: 'medical',
            title: 'Hồ sơ bệnh án',
            description: 'Theo dõi lịch sử khám bệnh, điều trị và tình trạng sức khỏe tổng thể của thú cưng.',
            meta: {
                last_visit: petData?.medical_record?.last_visit_date || 'Chưa có thông tin',
                diagnoses: petData?.medical_record?.diagnoses || 'Chưa có chẩn đoán'
            },
            bullets: [
                'Hồ sơ bệnh án điện tử',
                'Lịch sử điều trị',
                'Theo dõi thuốc men'
            ],
            actionText: 'Xem hồ sơ'
        }
    ];

    useEffect(() => {
        if (!petId) return;
        const fetchPet = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                const res = await fetch(`http://localhost:3000/api/v1/pet/${petId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Không tìm thấy thú cưng');
                    } else {
                        setError(`Lỗi khi lấy dữ liệu: ${res.status}`);
                    }
                    setPetData(null);
                    setUpcomingAppointments([]);
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                setPetData({
                    id: data.id ?? data.pet_id ?? petId,
                    name: data.name ?? '',
                    species: data.species,
                    gender: data.gender,
                    breed: data.breed,
                    color: data.color,
                    weight: data.weight,
                    dateOfBirth: data.dateOfBirth ?? data.dob,
                    age: data.age,
                    avatar_url: data.avatar_url ?? data.avatar,
                    owner: data.owner ?? data.owner_info ?? data.customer ?? null,
                    medical_record: data.medical_record ?? null
                });

                if (Array.isArray(data.upcomingAppointments)) {
                    setUpcomingAppointments(data.upcomingAppointments);
                } else {
                    try {
                        const aptRes = await fetch(`http://localhost:3000/api/v1/pet/${petId}/appointments`, {
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                            }
                        });
                        if (aptRes.ok) {
                            const aptData = await aptRes.json();
                            setUpcomingAppointments(Array.isArray(aptData) ? aptData : aptData.items ?? []);
                        }
                    } catch { /* ignore */ }
                }
            } catch (e) {
                console.error(e);
                setError('Lỗi khi kết nối tới server');
                setPetData(null);
                setUpcomingAppointments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [petId]);

    const formatDate = (iso?: string) => {
        if (!iso) return 'Chưa rõ';
        try {
            return new Date(iso).toLocaleDateString('vi-VN');
        } catch {
            return iso;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Đang tải thông tin thú cưng...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!petData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Không có dữ liệu thú cưng để hiển thị</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Hồ sơ thú cưng</h1>
                        <p className="text-gray-600">Quản lý thông tin và chăm sóc thú cưng của bạn</p>
                    </div>

                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thẻ căn cước thú cưng</h2>
                        <div className="flex justify-center items-center perspective-1000">
                            <div className="relative cursor-pointer" style={{ width: '600px', height: '380px' }} onClick={() => setIsFlipped(!isFlipped)}>
                                <motion.div className="w-full h-full" animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
                                    <div className="absolute backface-hidden" style={{ backfaceVisibility: 'hidden', width: '600px', height: '380px' }}>
                                        <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-2xl p-8 h-full text-gray-800 overflow-hidden border-2 border-gray-400">
                                            <div className="absolute inset-0 opacity-5">
                                                <img src="/sampleimg/catbg.jpg" alt="Background" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center">
                                                        <img src="/sampleimg/logo-card.png" alt="Logo" className="h-8 mr-3" />
                                                        <div>
                                                            <h3 className="text-2xl font-bold mb-1 text-gray-900">PETTOPIA</h3>
                                                            <p className="text-sm text-gray-700">Pet Identity Card</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-lg px-3 py-1 border border-gray-400">
                                                        <p className="text-xs text-gray-700">ID: {petData.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-gray-400 overflow-hidden">
                                                        <img src={petData.avatar_url || '/sampleimg/default-pet.jpg'} alt={petData.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-3xl font-bold mb-4 text-gray-900">{petData.name}</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-700">Giống:</p>
                                                                <p className="font-semibold text-gray-900">{petData.breed || 'Chưa rõ'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Màu lông:</p>
                                                                <p className="font-semibold text-gray-900">{petData.color || 'Chưa rõ'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Giới tính:</p>
                                                                <p className="font-semibold text-gray-900">{petData.gender || 'Chưa rõ'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Ngày sinh:</p>
                                                                <p className="font-semibold text-gray-900">{formatDate(petData.dateOfBirth)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-6 pt-6 border-t-2 border-gray-400">
                                                    <p className="text-xs text-gray-700 text-center">Click để xem mặt sau</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', width: '600px', height: '380px' }}>
                                        <div className="relative bg-gradient-to-br from-gray-300 to-gray-200 rounded-2xl shadow-2xl p-8 h-full text-gray-800 overflow-hidden border-2 border-gray-400">
                                            <div className="absolute inset-0 opacity-5">
                                                <img src="/sampleimg/logo.png" alt="Background" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center mb-6">
                                                    <img src="/sampleimg/logo-card.png" alt="Logo" className="h-8 mr-3" />
                                                    <h3 className="text-xl font-bold text-gray-900">Thông tin chủ sở hữu</h3>
                                                </div>
                                                <div className="space-y-4 text-sm">
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Cân nặng:</span>
                                                        <span className="font-semibold text-gray-900">{petData.weight || 'Chưa rõ'} kg</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Màu lông:</span>
                                                        <span className="font-semibold text-gray-900">{petData.color || 'Chưa rõ'}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Chủ sở hữu:</span>
                                                        <span className="font-semibold text-gray-900">{petData.owner?.fullname || 'Chưa có thông tin'}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Số điện thoại:</span>
                                                        <span className="font-semibold text-gray-900">{petData.owner?.phone || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Email:</span>
                                                        <span className="font-semibold text-xs text-gray-900">{petData.owner?.email || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-700">Địa chỉ:</span>
                                                        <span className="font-semibold text-xs text-gray-900">
                                                            {petData.owner?.address?.ward && petData.owner?.address?.district 
                                                                ? `${petData.owner.address.ward}, ${petData.owner.address.district}`
                                                                : 'Chưa cập nhật'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-6 pt-6 border-t-2 border-gray-400">
                                                    <p className="text-xs text-gray-700 text-center">Click để xem mặt trước</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    <section ref={servicesRef} className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tính năng quản lý</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {mockFeatures.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: i * 0.2 }}
                                    className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100 hover:shadow-xl transition cursor-pointer flex flex-col"
                                >
                                    <div className="flex items-start mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">{f.title}</h3>
                                    </div>
                                    <p className="text-gray-600 mb-6">{f.description}</p>
                                    {f.meta && (
                                        <div className="bg-teal-50 rounded-lg p-4 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Khám gần nhất:</span>
                                                <span className="text-sm font-semibold">{f.meta.last_visit}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{f.meta.diagnoses}</p>
                                        </div>
                                    )}
                                    <div className="space-y-3 flex-grow">
                                        {f.bullets.map((b, idx) => (
                                            <div key={idx} className="flex items-start text-sm text-gray-600">
                                                <svg className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="mt-6 w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition h-12">{f.actionText}</button>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lịch hẹn sắp tới</h2>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                            <UpcomingMeetings />
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Lịch đã đặt</h3>
                                    {upcomingAppointments.map((apt) => (
                                        <div key={apt.appointment_id ?? apt.id} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{apt.service ?? apt.title}</h4>
                                                    <p className="text-sm text-gray-600">{new Date(apt.checkout_time ?? apt.time).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">{apt.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center pt-4">
                                    <p className="text-gray-600">Chưa có lịch hẹn</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thông tin chi tiết</h2>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                                        <img src={petData.avatar_url || '/sampleimg/default-pet.jpg'} alt={petData.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{petData.name}</h3>
                                        <p className="text-gray-600">
                                            {petData.species || 'Chưa rõ'} • {petData.gender || 'Chưa rõ'} • {petData.age || 'Chưa rõ'} tuổi
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPetDetails(!showPetDetails)} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
                                    {showPetDetails ? 'Ẩn chi tiết' : 'Hiển thị chi tiết'}
                                </button>
                            </div>
                            {showPetDetails && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }} className="border-t border-gray-200 pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Loài:</span>
                                                    <span className="font-medium">{petData.species || 'Chưa rõ'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Giống:</span>
                                                    <span className="font-medium">{petData.breed || 'Chưa rõ'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Giới tính:</span>
                                                    <span className="font-medium">{petData.gender || 'Chưa rõ'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Ngày sinh:</span>
                                                    <span className="font-medium">{formatDate(petData.dateOfBirth)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Cân nặng:</span>
                                                    <span className="font-medium">{petData.weight || 'Chưa rõ'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Màu lông:</span>
                                                    <span className="font-medium">{petData.color || 'Chưa rõ'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Thông tin y tế</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Mã hồ sơ:</span>
                                                    <span className="font-medium">{petData.medical_record?.record_id || 'Chưa có'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Khám gần nhất:</span>
                                                    <span className="font-medium">{petData.medical_record?.last_visit_date || 'Chưa có'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 block mb-2">Chẩn đoán:</span>
                                                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                                                        {petData.medical_record?.diagnoses || 'Chưa có thông tin'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 block mb-2">Ghi chú:</span>
                                                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                                                        {petData.medical_record?.notes || 'Chưa có ghi chú'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {petData.medical_record?.treatment && petData.medical_record.treatment.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-4">Điều trị hiện tại</h4>
                                            <div className="space-y-3">
                                                {petData.medical_record.treatment.map((med, index) => (
                                                    <div key={index} className="bg-teal-50 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-semibold text-gray-900">{med.medicine || 'Chưa rõ'}</h5>
                                                            <span className="text-sm text-teal-600 font-medium">{med.duration || 'Chưa rõ'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div><span className="font-medium">Liều lượng:</span> {med.dosage || 'Chưa rõ'}</div>
                                                            <div><span className="font-medium">Tần suất:</span> {med.frequency || 'Chưa rõ'}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4">Thông tin chủ sở hữu</h4>
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div className="pr-5">
                                                        <span className="text-gray-600 mr-2">Họ tên:</span>
                                                        <span className="font-medium">{petData.owner?.fullname || 'Chưa có thông tin'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="pr-5">
                                                        <span className="text-gray-600 mr-2">Số điện thoại:</span>
                                                        <span className="font-medium">{petData.owner?.phone || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="pr-5">
                                                        <span className="text-gray-600 mr-2">Email:</span>
                                                        <span className="font-medium">{petData.owner?.email || 'Chưa cập nhật'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => setShowCustomerId(!showCustomerId)}
                                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    {showCustomerId ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                            </svg>
                                                            Ẩn mã khách hàng
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Hiện mã khách hàng
                                                        </>
                                                    )}
                                                </button>

                                                {showCustomerId && (
                                                    <div className="pr-5 mt-2">
                                                        <span className="text-gray-600 mr-2">Mã khách hàng:</span>
                                                        <span className="font-medium font-mono">{petData.owner?.user_id || 'Chưa có'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>
        </div>
    );
}