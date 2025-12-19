'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { getPetById, getAppointments, type MedicalRecord, type PetMedicalRecord, type PetDetailResponse } from '@/services/petcare/petService';

interface Owner {
  user_id: string;
  fullname: string;
  phone?: string;
  email?: string;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
    description?: string;
  };
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
  qr_code_url?: string;
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
    const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!petId) return;
        
        const fetchPetData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gọi petService để lấy thông tin thú cưng (đã bao gồm medical records)
                const data: PetDetailResponse = await getPetById(petId as string);
                const apiData = data as Record<string, any>;

                setPetData({
                    id: data.id ?? apiData.pet_id ?? petId,
                    name: data.name ?? '',
                    species: data.species,
                    gender: data.gender,
                    breed: data.breed,
                    color: data.color,
                    weight: data.weight,
                    dateOfBirth: data.dateOfBirth ?? apiData.dob,
                    age: apiData.age,
                    avatar_url: data.avatar_url ?? apiData.avatar,
                    qr_code_url: data.qr_code_url ?? apiData.qr_code_url,
                    owner: data.owner ?? apiData.owner_info ?? apiData.customer ?? null,
                    medical_record: apiData.medical_record ?? null
                });

                // Lấy danh sách lịch hẹn sắp tới
                try {
                    const appointmentsData = await getAppointments({ page: 1, limit: 200 });
                    const appointments = appointmentsData.data || [];
                    // Filter appointments của pet này
                    const petAppointments = appointments.filter((apt: any) => 
                        apt.pet_ids?.includes(petId as string)
                    );
                    setUpcomingAppointments(petAppointments.length > 0 ? petAppointments : appointments);
                } catch {
                    // Nếu lấy appointments thất bại, để trống danh sách
                    setUpcomingAppointments([]);
                }

                // Sử dụng medical records từ getPetById (đã được cải tiến)
                if (data.medical_records && Array.isArray(data.medical_records)) {
                    // Chuyển đổi format từ PetMedicalRecord (có medicalRecord và medications) 
                    // sang format hiển thị (có appointmentId, appointmentDate, record)
                    const formattedRecords = data.medical_records.map((mr) => {
                        return {
                            appointmentId: mr.medicalRecord?.appointment_id || '',
                            appointmentDate: mr.medicalRecord?.createdAt || '',
                            appointmentStatus: 'Completed' as const, // Mặc định vì đã có medical record
                            record: {
                                symptoms: mr.medicalRecord?.symptoms || '',
                                diagnosis: mr.medicalRecord?.diagnosis || '',
                                notes: mr.medicalRecord?.notes || '',
                                prescription: mr.medications?.map((m) => 
                                    `${m.medication_name} - ${m.dosage} - ${m.instructions}`
                                ).join('\n') || ''
                            }
                        };
                    });
                    // Sắp xếp theo ngày mới nhất
                    formattedRecords.sort((a, b) => 
                        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
                    );
                    setMedicalRecords(formattedRecords);
                } else {
                    setMedicalRecords([]);
                }
            } catch (e) {
                console.error('Error fetching pet data:', e);
                if ((e as any)?.response?.status === 404) {
                    setError('Không tìm thấy thú cưng');
                } else {
                    setError('Lỗi khi kết nối tới server');
                }
                setPetData(null);
                setUpcomingAppointments([]);
                setMedicalRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPetData();
    }, [petId]);

    const formatDate = (iso?: string) => {
        if (!iso) return 'Chưa rõ';
        try {
            return new Date(iso).toLocaleDateString('vi-VN');
        } catch {
            return iso;
        }
    };

    const formatGender = (gender?: string) => {
        if (!gender) return 'Chưa rõ';
        const genderLower = gender.toLowerCase();
        if (genderLower === 'male' || genderLower === 'đực') return 'Đực';
        if (genderLower === 'female' || genderLower === 'cái') return 'Cái';
        return gender;
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
                                                            <p className="text-sm text-gray-700">Pet Identity Card • PetID: {petData.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                    {petData.qr_code_url && (
                                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-400 overflow-hidden">
                                                            <img src={petData.qr_code_url} alt="QR Code" className="w-full h-full object-contain" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-gray-400 overflow-hidden">
                                                            <img src={petData.avatar_url || '/sampleimg/default-pet.jpg'} alt={petData.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-3xl font-bold mb-4 text-gray-900 truncate">{petData.name}</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-700">Giống:</p>
                                                                <p className="font-semibold text-gray-900 truncate">{petData.breed || 'Chưa rõ'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Màu lông:</p>
                                                                <p className="font-semibold text-gray-900 truncate">{petData.color || 'Chưa rõ'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Giới tính:</p>
                                                                <p className="font-semibold text-gray-900 truncate">{formatGender(petData.gender)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Ngày sinh:</p>
                                                                <p className="font-semibold text-gray-900 truncate">{formatDate(petData.dateOfBirth)}</p>
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
                                                        <span className="font-semibold text-gray-900 truncate ml-2">{petData.owner?.fullname || 'Chưa có thông tin'}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Số điện thoại:</span>
                                                        <span className="font-semibold text-gray-900 truncate ml-2">{petData.owner?.phone || 'Chưa cập nhật'}</span>
                                                    </div>
                                                
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-700">Địa chỉ:</span>
                                                        <span className="font-semibold text-xs text-gray-900 truncate ml-2">
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

                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thông tin chi tiết</h2>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100">
                                        <img src={petData.avatar_url || '/sampleimg/default-pet.jpg'} alt={petData.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 truncate">{petData.name}</h3>
                                        <p className="text-gray-600 truncate">
                                            {petData.species || 'Chưa rõ'} • {formatGender(petData.gender)} • {petData.age || 'Chưa rõ'} tuổi
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPetDetails(!showPetDetails)} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex-shrink-0">
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
                                                    <span className="font-medium">{formatGender(petData.gender)}</span>
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
                                                    <span className="font-medium truncate ml-2">{petData.medical_record?.record_id || 'Chưa có'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Khám gần nhất:</span>
                                                    <span className="font-medium">{formatDate(petData.medical_record?.last_visit_date)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 block mb-2">Chẩn đoán:</span>
                                                    <p className="text-sm bg-gray-50 p-3 rounded-lg break-words line-clamp-3">
                                                        {petData.medical_record?.diagnoses || 'Chưa có thông tin'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 block mb-2">Ghi chú:</span>
                                                    <p className="text-sm bg-gray-50 p-3 rounded-lg break-words line-clamp-3">
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
                                                {petData.medical_record.treatment.map((med: { medicine?: string; dosage?: string; frequency?: string; duration?: string }, index: number) => (
                                                    <div key={index} className="bg-teal-50 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-semibold text-gray-900 truncate">{med.medicine || 'Chưa rõ'}</h5>
                                                            <span className="text-sm text-teal-600 font-medium ml-2 flex-shrink-0">{med.duration || 'Chưa rõ'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div><span className="font-medium">Liều lượng:</span> <span className="break-words">{med.dosage || 'Chưa rõ'}</span></div>
                                                            <div><span className="font-medium">Tần suất:</span> <span className="break-words">{med.frequency || 'Chưa rõ'}</span></div>
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
                                                        <span className="font-medium truncate block sm:inline">{petData.owner?.fullname || 'Chưa có thông tin'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="pr-5">
                                                        <span className="text-gray-600 mr-2">Số điện thoại:</span>
                                                        <span className="font-medium truncate block sm:inline">{petData.owner?.phone || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="pr-5">
                                                        <span className="text-gray-600 mr-2">Email:</span>
                                                        <span className="font-medium truncate block sm:inline break-all text-xs">{petData.owner?.email || 'Chưa cập nhật'}</span>
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
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Ẩn mã khách hàng
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Hiện mã khách hàng
                                                        </>
                                                    )}
                                                </button>

                                                {showCustomerId && (
                                                    <div className="pr-5 mt-2">
                                                        <span className="mr-2">Mã khách hàng:</span> 
                                                        <span className="font-medium font-mono break-all">{petData.owner?.user_id || 'Chưa có'}</span>
                                                        <br/>
                                                        <span className='text-gray-600 text-sm italic'> Mã khách hàng sử dụng trong các tình huống hỗ trợ cần sự giúp đỡ của nhân viên</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    <section ref={servicesRef} className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Hồ sơ bệnh án</h2>
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Đang tải hồ sơ bệnh án...</p>
                            </div>
                        ) : medicalRecords.length > 0 ? (
                            <div className="space-y-6">
                                {medicalRecords.map((item, index) => (
                                    <motion.div
                                        key={item.appointmentId}
                                        initial={{ y: 50, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition"
                                    >
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">Lần khám: {formatDate(item.appointmentDate)}</h3>
                                                    <p className="text-sm text-gray-600">Mã lịch hẹn: {item.appointmentId.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link 
                                                    href={`/user/appointments/${item.appointmentId}/medical-record`}
                                                    className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                                                >
                                                    Xem hồ sơ bệnh án
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </Link>
                                                <Link 
                                                    href={`/user/appointments/${item.appointmentId}`}
                                                    className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
                                                >
                                                    Xem lịch hẹn
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {item.record.symptoms && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Triệu chứng:</h4>
                                                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                                        {item.record.symptoms}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {item.record.diagnosis && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Chẩn đoán:</h4>
                                                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                                        {item.record.diagnosis}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {item.record.prescription && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Đơn thuốc:</h4>
                                                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                                        {item.record.prescription}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {item.record.notes && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Ghi chú:</h4>
                                                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                                        {item.record.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 shadow-lg border border-teal-100 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hồ sơ bệnh án</h3>
                                <p className="text-gray-600">Hồ sơ bệnh án sẽ được hiển thị sau khi các lịch hẹn được hoàn thành.</p>
                            </div>
                        )}
                    </section>

                    {/* <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lịch hẹn sắp tới</h2>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                        
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Lịch đã đặt</h3>
                                    {upcomingAppointments.map((apt) => (
                                        <div key={apt.appointment_id ?? apt.id ?? apt._id} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{apt.service ?? apt.title ?? 'Dịch vụ'}</h4>
                                                    <p className="text-sm text-gray-600">{new Date(apt.checkout_time ?? apt.date ?? apt.time).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
                    </section> */}

                    
        </div>
    );
}