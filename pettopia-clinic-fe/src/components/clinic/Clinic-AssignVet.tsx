import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Clock,
    Calendar,
    User,
    Phone,
    PawPrint,
    Loader2,
    X,
    ChevronRight,
    Filter,
    RefreshCw,
    AlertCircle,
    Stethoscope,
    Sun,
    Sunset,
    Moon,
} from 'lucide-react';
import { getAppointments, getAppointmentDetail, assignVetToAppointment } from '@/services/partner/clinicService';
import { getCustomerById } from '@/services/customer/customerService';
import { getClinicVets, ClinicMembersResponse, VetMember } from '@/services/partner/veterianrianService';
import { useToast } from '@/contexts/ToastContext';

interface AppointmentData {
    id?: string;
    _id?: string;
    date: string;
    shift: string;
    status: string;
    customer?: string;
    user_id?: string;
    customer_name?: string;
    phone?: string;
    pet_ids?: string[];
    pet_names?: string[];
    service_names?: string[];
    created_by?: string;
}

interface AppointmentDetail {
    id: string;
    date: string;
    shift: string;
    status: string;
    user_info: {
        fullname: string;
        phone_number: string;
    };
    service_infos: Array<{
        name: string;
        price: number;
        duration: number;
    }>;
    pet_infos: Array<{
        id: string;
        name: string;
        species: string;
        breed: string;
        gender: string;
        color: string;
        weight: number;
        dateOfBirth: string;
        avatar_url?: string;
    }>;
}

export default function AssignVetPage() {
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [assigningVet, setAssigningVet] = useState(false);
    const [filterShift, setFilterShift] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [clinicVets, setClinicVets] = useState<VetMember[]>([]);
    const [loadingVets, setLoadingVets] = useState(false);
    const [selectedVetId, setSelectedVetId] = useState<string>('');
    const { showSuccess, showError } = useToast();

    // Load danh sách lịch hẹn đã check-in (có thể trong ngày hoặc toàn bộ, tùy backend)
    const loadCheckedInAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAppointments(1, 1000);
            if (response.status === 'success' && response.data) {
                const enrichedAppointments = await Promise.all(
                    response.data.map(async (apt: AppointmentData) => {
                        const enriched: AppointmentData = { ...apt };

                        const customerId = apt.customer || apt.user_id;
                        if (customerId) {
                            try {
                                const customerData = await getCustomerById(customerId);
                                const fullname = customerData?.data?.fullname || customerData?.fullname;
                                const phone = customerData?.data?.phone_number || customerData?.phone_number;

                                if (fullname) {
                                    enriched.customer_name = fullname;
                                }
                                if (phone) {
                                    enriched.phone = phone;
                                }
                            } catch (err) {
                                console.warn(`Không thể lấy thông tin khách hàng ${customerId}:`, err);
                            }
                        }

                        return enriched;
                    })
                );

                // Chỉ lấy các lịch hẹn đã check-in
                const checkedIn = enrichedAppointments.filter((apt: AppointmentData) => {
                    const status = apt.status?.toLowerCase();
                    return status === 'checked_in' || status === 'checked-in';
                });

                setAppointments(checkedIn);
            } else {
                setAppointments([]);
            }
        } catch (err: any) {
            setError(err?.message || 'Không thể tải danh sách lịch hẹn đã check-in');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCheckedInAppointments();

        const loadVets = async () => {
            try {
                setLoadingVets(true);
                const response: ClinicMembersResponse = await getClinicVets();
                if (response.data?.members) {
                    setClinicVets(response.data.members);
                } else {
                    setClinicVets([]);
                }
            } catch (err) {
                console.error('Không thể tải danh sách bác sĩ để assign:', err);
                setClinicVets([]);
            } finally {
                setLoadingVets(false);
            }
        };

        loadVets();
    }, []);

    const filteredAppointments = useMemo(() => {
        let filtered = [...appointments];

        if (filterShift !== 'all') {
            filtered = filtered.filter(apt => apt.shift?.toLowerCase() === filterShift);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(apt => {
                const customerName = (apt.customer_name || '').toLowerCase();
                const phone = (apt.phone || '').toLowerCase();
                const id = (apt.id || apt._id || '').toLowerCase();

                return customerName.includes(query) ||
                    phone.includes(query) ||
                    id === query;
            });
        }

        const shiftOrder = { morning: 1, afternoon: 2, evening: 3 };
        filtered.sort((a, b) => {
            const orderA = shiftOrder[a.shift?.toLowerCase() as keyof typeof shiftOrder] || 999;
            const orderB = shiftOrder[b.shift?.toLowerCase() as keyof typeof shiftOrder] || 999;
            return orderA - orderB;
        });

        return filtered;
    }, [appointments, searchQuery, filterShift]);

    const getShiftLabel = (shift: string) => {
        switch (shift?.toLowerCase()) {
            case 'morning': return 'Sáng';
            case 'afternoon': return 'Chiều';
            case 'evening': return 'Tối';
            default: return shift || 'N/A';
        }
    };

    const getShiftColor = (shift: string) => {
        switch (shift?.toLowerCase()) {
            case 'morning': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'afternoon': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'evening': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getShiftIcon = (shift: string) => {
        switch (shift?.toLowerCase()) {
            case 'morning': return <Sun size={16} />;
            case 'afternoon': return <Sunset size={16} />;
            case 'evening': return <Moon size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch {
            return 'N/A';
        }
    };

    const handleViewDetail = async (appointmentId: string) => {
        setLoadingDetail(true);
        setShowDetailModal(true);
        setError(null);
        setSelectedVetId('');
        try {
            const response = await getAppointmentDetail(appointmentId);
            if (response.status === 'success' && response.data) {
                const detail = response.data as any;
                if (detail._id && !detail.id) {
                    detail.id = detail._id;
                }
                setSelectedAppointment(detail);
            }
        } catch (err: any) {
            setError(err?.message || 'Không thể tải chi tiết lịch hẹn');
            setSelectedAppointment(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleAssignVet = async (appointmentId: string) => {
        if (!selectedVetId) {
            showError('Vui lòng chọn bác sĩ trước khi gán.');
            return;
        }

        if (!confirm('Xác nhận gán bác sĩ cho lịch hẹn này?')) return;

        setAssigningVet(true);
        setError(null);

        try {
            await assignVetToAppointment(appointmentId, selectedVetId);

            await loadCheckedInAppointments();

            setShowDetailModal(false);
            setSelectedAppointment(null);
            setSelectedVetId('');

            showSuccess('Gán bác sĩ cho lịch hẹn thành công!');
        } catch (err: any) {
            console.error('Lỗi khi gán bác sĩ:', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gán bác sĩ';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setAssigningVet(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={loadCheckedInAppointments}
                            disabled={loading}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Làm mới
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-3 text-red-400 hover:text-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-blue-600 font-medium">Tổng lịch đã check-in</p>
                            <p className="text-2xl font-bold text-blue-900">{appointments.length}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <p className="text-sm text-amber-600 font-medium">Ca sáng</p>
                            <p className="text-2xl font-bold text-amber-900">
                                {appointments.filter(a => a.shift?.toLowerCase() === 'morning').length}
                            </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <p className="text-sm text-orange-600 font-medium">Ca chiều</p>
                            <p className="text-2xl font-bold text-orange-900">
                                {appointments.filter(a => a.shift?.toLowerCase() === 'afternoon').length}
                            </p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <p className="text-sm text-indigo-600 font-medium">Ca tối</p>
                            <p className="text-2xl font-bold text-indigo-900">
                                {appointments.filter(a => a.shift?.toLowerCase() === 'evening').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-3 mb-3">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, số điện thoại hoặc mã lịch hẹn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-lg border transition flex items-center gap-2 ${showFilters
                                ? 'bg-teal-600 text-white border-teal-600'
                                : ' text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={20} />
                            Lọc ca
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'all', label: 'Tất cả ca' },
                                    { value: 'morning', label: 'Ca sáng' },
                                    { value: 'afternoon', label: 'Ca chiều' },
                                    { value: 'evening', label: 'Ca tối' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilterShift(option.value as any)}
                                        className={`px-4 py-2 rounded-lg border transition ${filterShift === option.value
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {(searchQuery || filterShift !== 'all') && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Đang lọc:</span>
                                {filterShift !== 'all' && (
                                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full flex items-center gap-1">
                                        {getShiftLabel(filterShift)}
                                        <button onClick={() => setFilterShift('all')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                                        Tìm kiếm: {searchQuery}
                                        <button onClick={() => setSearchQuery('')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-2" />
                            <span className="text-gray-600">Đang tải danh sách...</span>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600">
                                {appointments.length === 0
                                    ? 'Không có lịch hẹn đã check-in'
                                    : 'Không tìm thấy lịch hẹn phù hợp'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredAppointments.map((apt) => (
                                <div
                                    key={apt.id || apt._id}
                                    className="p-4 hover:bg-gray-50 transition cursor-pointer"
                                    onClick={() => handleViewDetail(apt.id || apt._id || '')}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getShiftColor(apt.shift)} flex items-center gap-1`}>
                                                    {getShiftIcon(apt.shift)}
                                                    {getShiftLabel(apt.shift)}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {formatDate(apt.date)} lúc {formatTime(apt.date)}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="text-gray-400" size={16} />
                                                        <span className="font-semibold text-gray-900">
                                                            {apt.customer_name || 'Khách hàng'}
                                                        </span>
                                                    </div>
                                                    {apt.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="text-gray-400" size={16} />
                                                            <span className="text-gray-600 text-sm">{apt.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {apt.pet_ids && apt.pet_ids.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <PawPrint className="text-gray-400" size={16} />
                                                        <span className="text-gray-600 text-sm">
                                                            {apt.pet_ids.length} thú cưng
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <ChevronRight className="text-gray-400" size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!loading && filteredAppointments.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Hiển thị <strong>{filteredAppointments.length}</strong> / <strong>{appointments.length}</strong> lịch hẹn đã check-in
                    </div>
                )}
            </div>

            {showDetailModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">Chi tiết lịch hẹn & gán bác sĩ</h3>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedAppointment(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-2" />
                                    <span className="text-gray-600">Đang tải chi tiết...</span>
                                </div>
                            ) : selectedAppointment ? (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Họ tên</p>
                                                <p className="font-medium text-gray-900">{selectedAppointment.user_info.fullname}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Số điện thoại</p>
                                                <p className="font-medium text-gray-900">{selectedAppointment.user_info.phone_number}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedAppointment.pet_infos && selectedAppointment.pet_infos.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Thú cưng</h4>
                                            <div className="space-y-3">
                                                {selectedAppointment.pet_infos.map((pet) => (
                                                    <div key={pet.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <div className="flex gap-4">
                                                            {pet.avatar_url && (
                                                                <img
                                                                    src={pet.avatar_url}
                                                                    alt={pet.name}
                                                                    className="w-16 h-16 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{pet.name}</p>
                                                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                                    <p>Loài: {pet.species}</p>
                                                                    <p>Giống: {pet.breed}</p>
                                                                    <p>Giới tính: {pet.gender === 'Male' ? 'Đực' : 'Cái'}</p>
                                                                    <p>Cân nặng: {pet.weight} kg</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                <Stethoscope className="text-teal-600" size={18} />
                                                Chọn bác sĩ phụ trách
                                            </h4>
                                            {loadingVets && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Loader2 className="animate-spin" size={14} />
                                                    Đang tải danh sách bác sĩ...
                                                </span>
                                            )}
                                        </div>
                                        {clinicVets.length === 0 && !loadingVets ? (
                                            <p className="text-sm text-gray-500">
                                                Chưa có bác sĩ nào trong phòng khám hoặc không thể tải danh sách bác sĩ.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                <select
                                                    value={selectedVetId}
                                                    onChange={(e) => setSelectedVetId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                >
                                                    <option value="">-- Chọn bác sĩ --</option>
                                                    {clinicVets.map((vet) => (
                                                        <option key={vet.member_id} value={vet.member_id}>
                                                            {vet.fullname || `Vet ${vet.member_id.slice(0, 8)}`} - {vet.specialty || 'Chưa cập nhật chuyên khoa'}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedVetId && (
                                                    <p className="text-xs text-gray-500">
                                                        Bác sĩ được chọn sẽ phụ trách lịch hẹn này.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedAppointment.service_infos && selectedAppointment.service_infos.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Dịch vụ</h4>
                                            <div className="space-y-2">
                                                {selectedAppointment.service_infos.map((service, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{service.name}</p>
                                                            <p className="text-sm text-gray-600">Thời gian: {service.duration} phút</p>
                                                        </div>
                                                        <p className="font-semibold text-teal-600">
                                                            {service.price.toLocaleString('vi-VN')} đ
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            const appointmentId = selectedAppointment.id || (selectedAppointment as any)._id;
                                            if (appointmentId) {
                                                handleAssignVet(appointmentId);
                                            } else {
                                                showError('Không tìm thấy ID lịch hẹn');
                                            }
                                        }}
                                        disabled={assigningVet}
                                        className="w-full px-6 py-4 rounded-lg transition font-semibold flex items-center justify-center gap-2 text-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        {assigningVet ? (
                                            <>
                                                <Loader2 className="animate-spin" size={24} />
                                                Đang gán bác sĩ...
                                            </>
                                        ) : (
                                            <>
                                                <Stethoscope size={24} />
                                                Xác nhận gán bác sĩ
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


