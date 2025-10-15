'use client'

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import UpcomingMeetings from '@/components/UpcomingMeetings'; 
// Interface có thể giữ lại nếu cần dùng ở những nơi khác
interface UserNavbarProps {
    setShowSearch: (show: boolean) => void;
    showSearch: boolean;
}

export default function UserPetPage() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showPetDetails, setShowPetDetails] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const servicesRef = useRef(null);
    const isInView = useInView(servicesRef, { once: true, amount: 0.3 });

    // Data based on database schema
    const petData = {
        pet_id: 'PET001',
        name: 'Max',
        species: 'Chó',
        gender: 'Male',
        age: 4,
        color: 'Vàng đồng',
        weight: 28,
        owner: {
            user_id: 'USER001',
            fullname: 'Nguyễn Văn A',
            phone: {
                phone_number: '0912345678',
                verified: true
            },
            email: {
                email_address: 'user@example.com',
                verified: true
            }
        },
        medical_record: {
            record_id: 'MED001',
            last_visit_date: '2024-09-15',
            diagnoses: 'Khỏe mạnh, tiêm phòng đầy đủ',
            treatment: [
                {
                    medicine: 'Vitamin tổng hợp',
                    dosage: '1 viên/ngày',
                    frequency: 'Hàng ngày',
                    duration: '30 ngày'
                }
            ],
            notes: 'Thú cưng rất khỏe mạnh, theo dõi định kỳ 6 tháng/lần'
        }
    };

    const upcomingAppointments = [
        {
            appointment_id: 'APT001',
            pet_id: 'PET001',
            service: 'Khám sức khỏe định kỳ',
            status: 'Pending',
            created_at: '2024-10-01',
            checkout_time: '2024-10-15T10:00:00'
        }
    ];

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Page Header */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-bold text-gray-900 mb-2">Hồ sơ thú cưng</h1>
                        <p className="text-gray-600">Quản lý thông tin và chăm sóc thú cưng của bạn</p>
                    </div>

                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thẻ căn cước thú cưng</h2>

                        <div className="flex justify-center items-center perspective-1000">
                            <div
                                className="relative cursor-pointer"
                               style={{ width: '600px', height: '380px' }}
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <motion.div
                                    className="w-full h-full"
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.6 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Front of card */}
                                    <div
                                        className="absolute backface-hidden"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            width: '600px',
                                            height: '380px'
                                        }}
                                    >
                                        <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-2xl p-8 h-full text-gray-800 overflow-hidden border-2 border-gray-400">
                                            {/* Background pattern */}
                                            <div className="absolute inset-0 opacity-5">
                                                <img 
                                                    src="/sampleimg/catbg.jpg" 
                                                    alt="Background" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center">
                                                        <img src="/sampleimg/logo.png" alt="Logo" className="h-8 mr-3" />
                                                        <div>
                                                            <h3 className="text-2xl font-bold mb-1 text-gray-900">PETTOPIA</h3>
                                                            <p className="text-sm text-gray-700">Pet Identity Card</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-lg px-3 py-1 border border-gray-400">
                                                        <p className="text-xs text-gray-700">ID: {petData.pet_id}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-6">
                                                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-gray-400">
                                                        <svg className="w-14 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </div>

                                                    <div className="flex-1">
                                                        <h4 className="text-3xl font-bold mb-4 text-gray-900">{petData.name}</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-700">Loài:</p>
                                                                <p className="font-semibold text-gray-900">{petData.species}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Màu lông:</p>
                                                                <p className="font-semibold text-gray-900">{petData.color}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Giới tính:</p>
                                                                <p className="font-semibold text-gray-900">{petData.gender}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-700">Tuổi:</p>
                                                                <p className="font-semibold text-gray-900">{petData.age} tuổi</p>
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

                                    {/* Back of card */}
                                    <div
                                        className="absolute backface-hidden"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                             width: '600px',
                                            height: '380px'
                                        }}
                                    >
                                        <div className="relative bg-gradient-to-br from-gray-300 to-gray-200 rounded-2xl shadow-2xl p-8 h-full text-gray-800 overflow-hidden border-2 border-gray-400">
                                            {/* Background pattern */}
                                            <div className="absolute inset-0 opacity-5">
                                                <img 
                                                    src="/sampleimg/logo.png" 
                                                    alt="Background" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-center mb-6">
                                                    <img src="/sampleimg/logo.png" alt="Logo" className="h-8 mr-3" />
                                                    <h3 className="text-xl font-bold text-gray-900">Thông tin chủ sở hữu</h3>
                                                </div>

                                                <div className="space-y-4 text-sm">
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Cân nặng:</span>
                                                        <span className="font-semibold text-gray-900">{petData.weight} kg</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Màu lông:</span>
                                                        <span className="font-semibold text-gray-900">{petData.color}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Chủ sở hữu:</span>
                                                        <span className="font-semibold text-gray-900">{petData.owner.fullname}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Số điện thoại:</span>
                                                        <span className="font-semibold text-gray-900">{petData.owner.phone.phone_number}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b-2 border-gray-400 pb-2">
                                                        <span className="text-gray-700">Email:</span>
                                                        <span className="font-semibold text-xs text-gray-900">{petData.owner.email.email_address}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-700">User ID:</span>
                                                        <span className="font-semibold text-gray-900">{petData.owner.user_id}</span>
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
                    {/* Section 2: Pet Features (Diary & Health Report) */}
                    <section ref={servicesRef} className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tính năng quản lý</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Pet Diary */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100 hover:shadow-xl transition cursor-pointer"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Nhật ký thú cưng</h3>
                                </div>

                                <p className="text-gray-600 mb-6">Ghi chép những khoảnh khắc đáng nhớ, hoạt động hàng ngày và những điều đặc biệt về thú cưng của bạn.</p>

                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Theo dõi hoạt động hàng ngày
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Ghi chú thói quen ăn uống
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Lưu trữ kỷ niệm đặc biệt
                                    </div>
                                </div>

                                <button className="mt-6 w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
                                    Xem nhật ký
                                </button>
                            </motion.div>

                            {/* Health Report */}
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100 hover:shadow-xl transition cursor-pointer"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Hồ sơ bệnh án</h3>
                                </div>

                                <p className="text-gray-600 mb-6">Theo dõi lịch sử khám bệnh, điều trị và tình trạng sức khỏe tổng thể của thú cưng.</p>

                                <div className="bg-teal-50 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Khám gần nhất:</span>
                                        <span className="text-sm font-semibold">{petData.medical_record.last_visit_date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{petData.medical_record.diagnoses}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Hồ sơ bệnh án điện tử
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Lịch sử điều trị
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Theo dõi thuốc men
                                    </div>
                                </div>

                                <button className="mt-6 w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
                                    Xem hồ sơ
                                </button>
                            </motion.div>
                        </div>
                    </section>

                    

                    {/* Section 3: Upcoming Appointments with Calendar */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lịch hẹn sắp tới</h2>

                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                            {/* Calendar View */}
                            
                                <UpcomingMeetings       />
                         

                            {/* Upcoming Appointments List */}
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Lịch đã đặt</h3>
                                    {upcomingAppointments.map((apt) => (
                                        <div key={apt.appointment_id} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{apt.service}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(apt.checkout_time).toLocaleDateString('vi-VN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                {apt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center pt-4">
                                    <p className="text-gray-600">Chọn ngày trên lịch để đặt lịch hẹn mới</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 4: Pet Information Detail */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thông tin chi tiết</h2>

                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-3xl text-white font-bold">{petData.name[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{petData.name}</h3>
                                        <p className="text-gray-600">{petData.species} • {petData.gender} • {petData.age} tuổi</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPetDetails(!showPetDetails)}
                                    className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
                                >
                                    {showPetDetails ? 'Ẩn chi tiết' : 'Hiển thị chi tiết'}
                                </button>
                            </div>

                            {showPetDetails && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-200 pt-6"
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Loài:</span>
                                                    <span className="font-medium">{petData.species}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Giới tính:</span>
                                                    <span className="font-medium">{petData.gender}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tuổi:</span>
                                                    <span className="font-medium">{petData.age} tuổi</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Cân nặng:</span>
                                                    <span className="font-medium">{petData.weight} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Màu lông:</span>
                                                    <span className="font-medium">{petData.color}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4">Thông tin y tế</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Mã hồ sơ:</span>
                                                    <span className="font-medium">{petData.medical_record.record_id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Khám gần nhất:</span>
                                                    <span className="font-medium">{petData.medical_record.last_visit_date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 block mb-2">Chẩn đoán:</span>
                                                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{petData.medical_record.diagnoses}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 block mb-2">Ghi chú:</span>
                                                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{petData.medical_record.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {petData.medical_record.treatment && petData.medical_record.treatment.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-4">Điều trị hiện tại</h4>
                                            <div className="space-y-3">
                                                {petData.medical_record.treatment.map((med, index) => (
                                                    <div key={index} className="bg-teal-50 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-semibold text-gray-900">{med.medicine}</h5>
                                                            <span className="text-sm text-teal-600 font-medium">{med.duration}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Liều lượng:</span> {med.dosage}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Tần suất:</span> {med.frequency}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}                  {/* Owner Information */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4">Thông tin chủ sở hữu</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Họ tên:</span>
                                                    <span className="font-medium">{petData.owner.fullname}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Mã khách hàng:</span>
                                                    <span className="font-medium">{petData.owner.user_id}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Số điện thoại:</span>
                                                    <span className="font-medium">{petData.owner.phone.phone_number}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="font-medium">{petData.owner.email.email_address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">Tìm kiếm</h3>
                                <button
                                    onClick={() => setShowSearch(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-4">
                                <input
                                    type="text"
                                    placeholder="Nhập từ khóa tìm kiếm..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 text-center">Không có kết quả tìm kiếm</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}