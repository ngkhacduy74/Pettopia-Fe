'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Filter, ChevronLeft, ChevronRight, X, CheckCircle, XCircle, Clock, Loader2, Sun, Sunset, Moon, RefreshCw } from 'lucide-react';
import NotificationBell from '@/components/common/NotificationBell';
import { useToast } from '@/contexts/ToastContext';
import { getAppointments, updateAppointmentStatus, getAppointmentDetail, type AppointmentData } from '@/services/partner/clinicService';
import { getCustomerById } from '@/services/customer/customerService';

// Helper: chuẩn hóa ngày về YYYY-MM-DD (dùng local time để tránh lệch múi giờ)
const toDateKey = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Interface mở rộng cho appointment với thông tin customer
interface ExtendedAppointment extends AppointmentData {
    customer_name?: string;
    pet_names?: string[];
    time?: string;
}

// Interface cho Appointment Detail từ API
interface AppointmentDetail {
    id: string;
    date: string;
    shift: string;
    status: string;
    user_info: {
        fullname: string;
        phone_number: string;
    };
    clinic_info: {
        clinic_name: string;
        email: {
            email_address: string;
        };
        phone: {
            phone_number: string;
        };
        address: {
            city: string;
            district: string;
            ward: string;
            detail: string;
        };
        representative: {
            name: string;
        };
    };
    service_infos: Array<{
        name: string;
        description: string;
        price: number;
        duration: number;
    }>;
    pet_infos: Array<{
        id: string;
        name: string;
        species: string;
        gender: string;
        breed: string;
        color: string;
        weight: number;
        dateOfBirth: string;
        owner: {
            fullname: string;
            phone: string;
            email: string;
        };
        avatar_url?: string;
    }>;
}

export default function AppointmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showSuccess, showError } = useToast();
    const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'table'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [appointmentDetail, setAppointmentDetail] = useState<AppointmentDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [dayViewDetails, setDayViewDetails] = useState<Map<string, AppointmentDetail>>(new Map());
    const [loadingDayDetails, setLoadingDayDetails] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

    // Kiểm tra query param appointmentId từ notification
    useEffect(() => {
        const appointmentId = searchParams.get('appointmentId');
        if (appointmentId && appointments.length > 0) {
            // Tìm appointment để lấy ngày
            const apt = appointments.find(a => (a.id || a._id) === appointmentId);
            if (apt) {
                const aptDate = new Date(apt.date);
                setCurrentDate(aptDate);
                setViewMode('day');
                setSelectedAppointmentId(appointmentId);
                loadAppointmentDetail(appointmentId);
                // Xóa query param sau khi đã xử lý
                router.replace('/clinic/appointment');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, appointments]);

    // Filters
    const [filters, setFilters] = useState({
        status: 'all' as 'all' | 'Confirmed' | 'Pending_Confirmation' | 'Cancelled',
        dateFrom: '',
        dateTo: '',
        createdBy: 'all' as 'all' | 'customer' | 'partner'
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Load appointments từ API
    const loadAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            // Calendar views cần load tất cả, table view dùng pagination
            const currentLimit = viewMode === 'table' ? limit : 1000;
            const currentPage = viewMode === 'table' ? page : 1;
            const response = await getAppointments(currentPage, currentLimit);
            if (response.status === 'success' && response.data) {
                // Enrich appointments với customer info nếu có (tối ưu: chỉ fetch khi cần)
                const enrichedAppointments: ExtendedAppointment[] = await Promise.all(
                    response.data.map(async (apt: AppointmentData) => {
                        const enriched: ExtendedAppointment = { ...apt };

                        // Lấy customer name nếu có customer_id hoặc user_id
                        const customerId = apt.customer || apt.user_id;
                        if (customerId) {
                            try {
                                const customerData = await getCustomerById(customerId);
                                // API response structure: { success: true, data: { fullname: "..." } } hoặc { data: { fullname: "..." } }
                                const fullname = customerData?.data?.fullname || customerData?.fullname;
                                if (fullname) {
                                    enriched.customer_name = fullname;
                                } else {
                                    enriched.customer_name = `Khách hàng ${customerId.substring(0, 8)}`;
                                }
                            } catch (err) {
                                console.warn(`Không thể lấy thông tin khách hàng ${customerId}:`, err);
                                enriched.customer_name = `Khách hàng ${customerId.substring(0, 8)}`;
                            }
                        } else {
                            enriched.customer_name = 'Khách hàng';
                        }

                        // Extract time từ date nếu có
                        if (apt.date) {
                            try {
                                const dateObj = new Date(apt.date);
                                if (!isNaN(dateObj.getTime())) {
                                    enriched.time = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                                }
                            } catch {
                                enriched.time = 'N/A';
                            }
                        }

                        return enriched;
                    })
                );

                setAppointments(enrichedAppointments);
                setTotal(response.pagination?.total || enrichedAppointments.length);
                setTotalPages(response.pagination?.totalPages || 1);
            } else {
                setAppointments([]);
                setTotal(0);
            }
        } catch (err: any) {
            setError(err?.message || 'Không thể tải danh sách lịch hẹn');
            setAppointments([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'table') {
            loadAppointments();
        } else {
            // Load tất cả appointments cho calendar views (không phân trang)
            loadAppointments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, viewMode]);

    // Reset page và reload khi filters thay đổi trong table view
    useEffect(() => {
        if (viewMode === 'table') {
            if (page !== 1) {
                setPage(1); // Reset về trang 1 sẽ trigger reload qua useEffect trên
            } else {
                // Nếu đã ở trang 1, reload trực tiếp
                loadAppointments();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, viewMode]);

    // Lọc dữ liệu
    const filteredAppointments = useMemo(() => {
        let filtered = [...appointments];

        if (filters.status !== 'all') {
            filtered = filtered.filter(a => a.status === filters.status);
        }
        if (filters.dateFrom) {
            filtered = filtered.filter(a => {
                try {
                    const aptDate = toDateKey(new Date(a.date));
                    return aptDate >= filters.dateFrom;
                } catch {
                    return false;
                }
            });
        }
        if (filters.dateTo) {
            filtered = filtered.filter(a => {
                try {
                    const aptDate = toDateKey(new Date(a.date));
                    return aptDate <= filters.dateTo;
                } catch {
                    return false;
                }
            });
        }
        if (filters.createdBy !== 'all') {
            filtered = filtered.filter(a => {
                // Xử lý cả trường hợp undefined/null và so sánh chính xác
                const createdBy = a.created_by || '';
                return createdBy === filters.createdBy;
            });
        }
        
        // Search filter: tìm theo ID (chính xác) hoặc tên khách hàng (partial match)
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(a => {
                const appointmentId = (a.id || a._id || '').toLowerCase();
                const customerName = (a.customer_name || '').toLowerCase();
                const customerId = (a.customer || a.user_id || '').toLowerCase();
                
                // Tìm chính xác theo ID
                if (appointmentId === query || customerId === query) {
                    return true;
                }
                // Tìm theo tên khách hàng (partial match)
                if (customerName.includes(query)) {
                    return true;
                }
                return false;
            });
        }
        
        return filtered;
    }, [appointments, filters, searchQuery]);

    // Helper functions
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending_Confirmation': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Confirmed': return 'bg-green-100 text-green-800 border-green-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Pending_Confirmation': return 'Chờ ';
            case 'Confirmed': return 'Xác nhận';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getShiftLabel = (shift: string) => {
        switch (shift?.toLowerCase()) {
            case 'morning': return 'Sáng';
            case 'afternoon': return 'Chiều';
            case 'evening': return 'Tối';
            default: return shift || 'N/A';
        }
    };

    // Tạo map customer với số thứ tự (Đơn 1, Đơn 2, ...)
    const getCustomerOrderMap = () => {
        const customerMap = new Map<string, number>();
        let order = 1;
        appointments.forEach(apt => {
            const customerKey = apt.customer || apt.user_id || apt.customer_name || 'unknown';
            if (!customerMap.has(customerKey)) {
                customerMap.set(customerKey, order++);
            }
        });
        return customerMap;
    };

    // Lấy số thứ tự của customer
    const getCustomerOrder = (customerId: string | undefined, customerName: string | undefined) => {
        const customerMap = getCustomerOrderMap();
        const customerKey = customerId || customerName || 'unknown';
        return customerMap.get(customerKey) || 0;
    };

    // Tạo màu dựa trên customer ID để mỗi khách hàng có màu riêng
    const getCustomerColor = (customerId: string | undefined, customerName: string | undefined) => {
        const id = customerId || customerName || 'default';
        // Tạo hash từ ID để có màu ổn định
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Danh sách màu đẹp và dễ phân biệt
        const colors = [
            'bg-blue-500 hover:bg-blue-600',
            'bg-teal-500 hover:bg-teal-600',
            'bg-green-500 hover:bg-green-600',
            'bg-amber-500 hover:bg-amber-600',
            'bg-orange-500 hover:bg-orange-600',
            'bg-red-500 hover:bg-red-600',
            'bg-pink-500 hover:bg-pink-600',
            'bg-purple-500 hover:bg-purple-600',
            'bg-indigo-500 hover:bg-indigo-600',
            'bg-cyan-500 hover:bg-cyan-600',
        ];

        return colors[Math.abs(hash) % colors.length];
    };

    // Icon cho ca làm việc
    const getShiftIcon = (shift: string) => {
        switch (shift?.toLowerCase()) {
            case 'morning': return <Sun className="w-5 h-5" />;
            case 'afternoon': return <Sunset className="w-5 h-5" />;
            case 'evening': return <Moon className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            // Nếu là định dạng YYYY-MM-DD từ date input, format trực tiếp
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            }
            // Nếu là date string khác, dùng Date object
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    const resetFilters = () => {
        setFilters({ status: 'all', dateFrom: '', dateTo: '', createdBy: 'all' });
        setSearchQuery('');
    };

    // Cập nhật trạng thái appointment
    const handleUpdateStatus = async (appointmentId: string, newStatus: string, cancelReason?: string) => {
        setUpdatingStatus(true);
        setError(null);
        try {
            await updateAppointmentStatus(appointmentId, newStatus, cancelReason);
            // Reload appointments và detail nếu đang xem detail
            await loadAppointments();
            if (appointmentDetail && (appointmentDetail.id === appointmentId || selectedAppointmentId === appointmentId)) {
                await loadAppointmentDetail(appointmentId);
            }
            // Trigger refresh notifications
            if (typeof window !== 'undefined') {
                // Dispatch custom event để NotificationBell có thể listen
                window.dispatchEvent(new CustomEvent('appointmentUpdated'));
                // Hoặc dùng localStorage event (hoạt động cross-tab)
                localStorage.setItem('appointment_updated', Date.now().toString());
            }
            // Hiển thị toast thành công và reload lại sau khi toast hiển thị
            const statusText = newStatus === 'Confirmed' ? 'xác nhận' : newStatus === 'Cancelled' ? 'hủy' : 'cập nhật';
            showSuccess(`Đã ${statusText} lịch hẹn thành công!`, undefined, () => {
                // Callback được gọi khi toast hiển thị - reload lại danh sách
                loadAppointments();
            });
        } catch (err: any) {
            const errorMessage = err?.message || 'Không thể cập nhật trạng thái lịch hẹn';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Xử lý hủy appointment với modal (có thể từ detail view hoặc table view)
    const handleCancelClick = (appointmentId?: string) => {
        // Nếu có appointmentId từ parameter (table view), dùng nó
        // Nếu không, dùng appointmentDetail.id (detail view)
        const idToCancel = appointmentId || appointmentDetail?.id;
        if (!idToCancel) return;
        setCancellingAppointmentId(idToCancel);
        setShowCancelModal(true);
        setCancelReason('');
    };

    // Xác nhận hủy appointment
    const handleConfirmCancel = async () => {
        if (!cancellingAppointmentId) return;
        if (!cancelReason.trim()) {
            setError('Vui lòng nhập lý do hủy');
            return;
        }
        // Lưu lại ID và lý do trước khi reset state
        const appointmentIdToCancel = cancellingAppointmentId;
        const reasonToCancel = cancelReason.trim();
        
        // Đóng modal và reset state ngay để UX tốt hơn
        setShowCancelModal(false);
        setCancelReason('');
        setCancellingAppointmentId(null);
        
        // Gọi handleUpdateStatus (đã có loadAppointments bên trong để reload danh sách)
        await handleUpdateStatus(appointmentIdToCancel, 'Cancelled', reasonToCancel);
    };

    const goToToday = () => setCurrentDate(new Date());

    // Load appointment detail
    const loadAppointmentDetail = async (appointmentId: string) => {
        setLoadingDetail(true);
        setError(null);
        try {
            const response = await getAppointmentDetail(appointmentId);
            if (response.status === 'success' && response.data) {
                const detail = response.data as any;
                // Đảm bảo luôn có id (nếu API trả về _id thì chuyển thành id)
                if (detail._id && !detail.id) {
                    detail.id = detail._id;
                }
                setAppointmentDetail(detail);
            }
        } catch (err: any) {
            setError(err?.message || 'Không thể tải chi tiết lịch hẹn');
            setAppointmentDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Load tất cả chi tiết appointments trong ngày
    const loadDayViewDetails = async (appointments: ExtendedAppointment[]) => {
        setLoadingDayDetails(true);
        setError(null);
        try {
            const detailsMap = new Map<string, AppointmentDetail>();
            await Promise.all(
                appointments.map(async (apt) => {
                    const id = apt.id || apt._id;
                    try {
                        const response = await getAppointmentDetail(id);
                        if (response.status === 'success' && response.data) {
                            detailsMap.set(id, response.data as any);
                        }
                    } catch (err) {
                        console.warn(`Không thể tải chi tiết appointment ${id}:`, err);
                    }
                })
            );
            setDayViewDetails(detailsMap);
        } catch (err: any) {
            setError(err?.message || 'Không thể tải chi tiết lịch hẹn');
        } finally {
            setLoadingDayDetails(false);
        }
    };

    // Handle row click in table view - chuyển sang day view và hiển thị chi tiết
    const handleRowClick = async (appointmentId: string, appointmentDate: string) => {
        // Tìm appointment để lấy ngày
        const apt = appointments.find(a => (a.id || a._id) === appointmentId);
        if (apt) {
            // Chuyển sang day view và set ngày
            const aptDate = new Date(apt.date);
            setCurrentDate(aptDate);
            setViewMode('day');
            setSelectedAppointmentId(appointmentId);
            await loadAppointmentDetail(appointmentId);
        }
    };

    // Close detail view
    const closeDetailView = () => {
        setSelectedAppointmentId(null);
        setAppointmentDetail(null);
    };

    const navigateDate = (dir: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + (dir === 'next' ? 1 : -1));
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (dir === 'next' ? 7 : -7));
        } else if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + (dir === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const setDateFilterAndSwitchToTable = (date: Date) => {
        const dateKey = toDateKey(date);
        setFilters(prev => ({ ...prev, dateFrom: dateKey, dateTo: dateKey }));
        setPage(1); // Reset về trang 1 khi chuyển từ calendar view
        setViewMode('table');
    };

    // Lấy lịch theo ngày
    const getAppointmentsForDate = (date: Date) => {
        const key = toDateKey(date);
        return filteredAppointments.filter(a => {
            try {
                const aptDate = toDateKey(new Date(a.date));
                return aptDate === key;
            } catch {
                return false;
            }
        });
    };

    // Tháng view
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDow = (firstDay.getDay() + 6) % 7; // Thứ 2 = 0, CN = 6 (theo VN)

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Ngày tháng trước
        for (let i = startDow - 1; i >= 0; i--) {
            days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
        }

        // Ngày hiện tại
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Ngày tháng sau
        const total = days.length;
        const remaining = total < 42 ? 42 - total : 35 - total;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    };

    // Tuần view (T2 → CN)
    const getWeekDays = () => {
        const start = new Date(currentDate);
        const dow = (start.getDay() + 6) % 7; // chuyển CN=0 → T2=0
        start.setDate(start.getDate() - dow);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    // Month View
    const MonthView = () => {
        const days = getDaysInMonth(currentDate);
        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full overflow-x-auto">
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 min-w-[700px]">
                    {weekDays.map(day => (
                        <div key={day} className="p-2 md:p-4 text-center font-semibold text-gray-700 text-xs md:text-sm">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 min-w-[700px]">
                    {days.map((day, idx) => {
                        const appts = getAppointmentsForDate(day.date);
                        const displayed = appts.slice(0, 3);
                        const more = appts.length - 3;
                        const todayKey = toDateKey(new Date());

                        return (
                            <div
                                key={idx}
                                className={`min-h-[100px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-gray-200 last:border-r-0 ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-gray-50 transition-colors`}
                            >
                                <div
                                    className={`text-sm font-medium mb-1 w-8 h-8 flex items-center justify-center rounded-full ${toDateKey(day.date) === todayKey
                                            ? 'bg-teal-600 text-white'
                                            : day.isCurrentMonth
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                        }`}
                                >
                                    {day.date.getDate()}
                                </div>
                                <div className="space-y-1 text-xs">
                                    {displayed.map(apt => {
                                        const order = getCustomerOrder(apt.customer || apt.user_id, apt.customer_name);
                                        return (
                                            <div
                                                key={apt.id || apt._id}
                                                onClick={() => setDateFilterAndSwitchToTable(day.date)}
                                                className={`${getCustomerColor(apt.customer || apt.user_id, apt.customer_name)} text-white px-2 py-1 rounded-lg cursor-pointer truncate transition-colors flex items-center gap-1.5 group relative`}
                                                title={apt.customer_name || 'Khách hàng'}
                                            >
                                                <span className="flex-shrink-0">{getShiftIcon(apt.shift)}</span>
                                                <span className="truncate">Đơn {order}</span>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                                                    {apt.customer_name || 'Khách hàng'}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {more > 0 && (
                                        <button
                                            onClick={() => setDateFilterAndSwitchToTable(day.date)}
                                            className="text-teal-600 hover:text-teal-800 font-medium"
                                        >
                                            +{more} lịch khác
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Week View
    const WeekView = () => {
        const days = getWeekDays();

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full overflow-x-auto">
                <div className="grid grid-cols-7 min-w-[800px]">
                    {days.map((date, i) => {
                        const appts = getAppointmentsForDate(date);
                        const displayed = appts.slice(0, 6);
                        const more = appts.length - 6;

                        return (
                            <div key={i} className="border-r border-gray-200 last:border-r-0">
                                <div className="bg-gray-50 p-3 text-center border-b border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </div>

                                    <div className="h-10 flex items-center justify-center">
                                        <div
                                            className={`text-lg font-bold ${toDateKey(date) === toDateKey(new Date())
                                                    ? 'bg-teal-600 text-white w-9 h-9 rounded-full flex items-center justify-center'
                                                    : ''
                                                }`}
                                        >
                                            {date.getDate()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 space-y-2 min-h-96">
                                    {displayed.map(apt => {
                                        const order = getCustomerOrder(apt.customer || apt.user_id, apt.customer_name);
                                        return (
                                            <div
                                                key={apt.id || apt._id}
                                                onClick={() => setDateFilterAndSwitchToTable(date)}
                                                className={`${getCustomerColor(apt.customer || apt.user_id, apt.customer_name)} text-white p-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-2 hover:opacity-90 group relative`}
                                                title={apt.customer_name || 'Khách hàng'}
                                            >
                                                <span className="flex-shrink-0">{getShiftIcon(apt.shift)}</span>
                                                <div className="font-medium truncate">Đơn {order}</div>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                                                    {apt.customer_name || 'Khách hàng'}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {more > 0 && (
                                        <button
                                            onClick={() => setDateFilterAndSwitchToTable(date)}
                                            className="w-full text-center text-teal-600 hover:text-teal-800 text-xs font-medium"
                                        >
                                            +{more} lịch khác
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Day View
    const DayView = () => {
        const appts = getAppointmentsForDate(currentDate);
        // Group theo customer key (ID hoặc name) để đảm bảo cùng customer có cùng số thứ tự
        const grouped = appts.reduce((acc, apt) => {
            const customerKey = apt.customer || apt.user_id || apt.customer_name || 'unknown';
            if (!acc[customerKey]) {
                acc[customerKey] = {
                    apts: [],
                    customerName: apt.customer_name || 'Khách hàng',
                    order: getCustomerOrder(apt.customer || apt.user_id, apt.customer_name)
                };
            }
            acc[customerKey].apts.push(apt);
            return acc;
        }, {} as Record<string, { apts: typeof appts; customerName: string; order: number }>);

        const customerKeys = Object.keys(grouped);

        // Handle click vào appointment để xem chi tiết
        const handleAppointmentClick = async (appointmentId: string) => {
            setSelectedAppointmentId(appointmentId);
            await loadAppointmentDetail(appointmentId);
        };

        // Nếu có selectedAppointmentId từ table view, hiển thị chi tiết một appointment
        if (selectedAppointmentId && appointmentDetail) {
            return (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full">
                        <div className="bg-gray-50 p-6 border-b border-gray-200">
                            <button
                                onClick={closeDetailView}
                                className="mb-4 text-teal-600 hover:text-teal-800 flex items-center gap-2 font-medium"
                            >
                                <ChevronLeft size={18} /> Quay lại
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Chi tiết lịch hẹn - {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h2>
                        </div>

                        <div className="p-6">
                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-2" />
                                    <span className="text-gray-600">Đang tải chi tiết...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Thông tin cơ bản */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Ngày</p>
                                                <p className="font-medium text-gray-900">{formatDate(appointmentDetail.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Ca</p>
                                                <p className="font-medium text-gray-900">{getShiftLabel(appointmentDetail.shift)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Trạng thái</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs border font-medium ${getStatusColor(appointmentDetail.status)}`}>
                                                    {getStatusLabel(appointmentDetail.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin khách hàng */}
                                    {appointmentDetail.user_info && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Họ tên</p>
                                                    <p className="font-medium text-gray-900">{appointmentDetail.user_info.fullname}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                                    <p className="font-medium text-gray-900">{appointmentDetail.user_info.phone_number}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Thông tin phòng khám */}
                                    {/* {appointmentDetail.clinic_info && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin phòng khám</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Tên phòng khám</p>
                                                    <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.clinic_name}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Email</p>
                                                        <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.email.email_address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Số điện thoại</p>
                                                        <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.phone.phone_number}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                                    <p className="font-medium text-gray-900">
                                                        {appointmentDetail.clinic_info.address.detail}, {appointmentDetail.clinic_info.address.ward}, {appointmentDetail.clinic_info.address.district}, {appointmentDetail.clinic_info.address.city}
                                                    </p>
                                                </div>
                                                {appointmentDetail.clinic_info.representative && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Người đại diện</p>
                                                        <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.representative.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )} */}

                                    {/* Danh sách dịch vụ */}
                                    {appointmentDetail.service_infos && appointmentDetail.service_infos.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dịch vụ</h3>
                                            <div className="space-y-3">
                                                {appointmentDetail.service_infos.map((service, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{service.name}</p>
                                                                {service.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                                )}
                                                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                                    <span>Thời gian: {service.duration} phút</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-teal-600">{service.price.toLocaleString('vi-VN')} đ</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Danh sách thú cưng */}
                                    {appointmentDetail.pet_infos && appointmentDetail.pet_infos.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thú cưng</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {appointmentDetail.pet_infos.map((pet) => (
                                                    <div key={pet.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <div className="flex gap-4">
                                                            {pet.avatar_url && (
                                                                <img 
                                                                    src={pet.avatar_url} 
                                                                    alt={pet.name}
                                                                    className="w-20 h-20 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{pet.name}</p>
                                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                                    <p>Loài: {pet.species}</p>
                                                                    <p>Giống: {pet.breed}</p>
                                                                    <p>Giới tính: {pet.gender === 'Male' ? 'Đực' : 'Cái'}</p>
                                                                    <p>Màu sắc: {pet.color}</p>
                                                                    <p>Cân nặng: {pet.weight} kg</p>
                                                                    <p>Ngày sinh: {formatDate(pet.dateOfBirth)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nút thao tác */}
                                    {appointmentDetail.status === 'Pending_Confirmation' && (
                                        <div className="bg-gray-50 rounded-lg p-4 border-t-2 border-teal-500">
                                           
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => appointmentDetail.id && handleUpdateStatus(appointmentDetail.id, 'Confirmed')}
                                                    disabled={updatingStatus}
                                                    className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    {updatingStatus ? (
                                                        <>
                                                            <Loader2 className="animate-spin h-5 w-5" />
                                                            <span>Đang xử lý...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span>Xác nhận lịch hẹn</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelClick()}
                                                    disabled={updatingStatus}
                                                    className="flex-1 px-4 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                    <span>Hủy lịch hẹn</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {appointmentDetail.status === 'Confirmed' && (
                                        <div className="bg-gray-50 rounded-lg p-4 border-t-2 border-green-500">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleCancelClick()}
                                                    disabled={updatingStatus}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    {updatingStatus ? (
                                                        <>
                                                            <Loader2 className="animate-spin h-5 w-5" />
                                                            <span>Đang xử lý...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-5 w-5" />
                                                            <span>Hủy lịch hẹn</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Nếu có selectedAppointmentId, hiển thị chi tiết một appointment
        if (selectedAppointmentId && appointmentDetail) {
            return (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full">
                        <div className="bg-gray-50 p-6 border-b border-gray-200">
                            <button
                                onClick={closeDetailView}
                                className="mb-4 text-teal-600 hover:text-teal-800 flex items-center gap-2 font-medium"
                            >
                                <ChevronLeft size={18} /> Quay lại
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Chi tiết lịch hẹn - {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h2>
                        </div>

                        <div className="p-6">
                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-2" />
                                    <span className="text-gray-600">Đang tải chi tiết...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Thông tin cơ bản */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Ngày</p>
                                                <p className="font-medium text-gray-900">{formatDate(appointmentDetail.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Ca</p>
                                                <p className="font-medium text-gray-900">{getShiftLabel(appointmentDetail.shift)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Trạng thái</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs border font-medium ${getStatusColor(appointmentDetail.status)}`}>
                                                    {getStatusLabel(appointmentDetail.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin khách hàng */}
                                    {appointmentDetail.user_info && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Họ tên</p>
                                                    <p className="font-medium text-gray-900">{appointmentDetail.user_info.fullname}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                                    <p className="font-medium text-gray-900">{appointmentDetail.user_info.phone_number}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Thông tin phòng khám */}
                                    {appointmentDetail.clinic_info && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin phòng khám</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Tên phòng khám</p>
                                                    <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.clinic_name}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Email</p>
                                                        <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.email.email_address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Số điện thoại</p>
                                                        <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.phone.phone_number}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                                    <p className="font-medium text-gray-900">
                                                        {appointmentDetail.clinic_info.address.detail}, {appointmentDetail.clinic_info.address.ward}, {appointmentDetail.clinic_info.address.district}, {appointmentDetail.clinic_info.address.city}
                                                    </p>
                                                </div>
                                                {appointmentDetail.clinic_info.representative && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Người đại diện</p>
                                                        <p className="font-medium text-gray-900">{appointmentDetail.clinic_info.representative.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Danh sách dịch vụ */}
                                    {appointmentDetail.service_infos && appointmentDetail.service_infos.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dịch vụ</h3>
                                            <div className="space-y-3">
                                                {appointmentDetail.service_infos.map((service, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{service.name}</p>
                                                                {service.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                                )}
                                                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                                    <span>Thời gian: {service.duration} phút</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-teal-600">{service.price.toLocaleString('vi-VN')} đ</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Danh sách thú cưng */}
                                    {appointmentDetail.pet_infos && appointmentDetail.pet_infos.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thú cưng</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {appointmentDetail.pet_infos.map((pet) => (
                                                    <div key={pet.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <div className="flex gap-4">
                                                            {pet.avatar_url && (
                                                                <img 
                                                                    src={pet.avatar_url} 
                                                                    alt={pet.name}
                                                                    className="w-20 h-20 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{pet.name}</p>
                                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                                    <p>Loài: {pet.species}</p>
                                                                    <p>Giống: {pet.breed}</p>
                                                                    <p>Giới tính: {pet.gender === 'Male' ? 'Đực' : 'Cái'}</p>
                                                                    <p>Màu sắc: {pet.color}</p>
                                                                    <p>Cân nặng: {pet.weight} kg</p>
                                                                    <p>Ngày sinh: {formatDate(pet.dateOfBirth)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nút thao tác */}
                                    {appointmentDetail.status === 'Pending_Confirmation' && (
                                        <div className="bg-gray-50 rounded-lg p-4 border-t-2 border-teal-500">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => appointmentDetail.id && handleUpdateStatus(appointmentDetail.id, 'Confirmed')}
                                                    disabled={updatingStatus}
                                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    {updatingStatus ? (
                                                        <>
                                                            <Loader2 className="animate-spin h-5 w-5" />
                                                            <span>Đang xử lý...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span>Xác nhận lịch hẹn</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelClick()}
                                                    disabled={updatingStatus}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                    <span>Hủy lịch hẹn</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {appointmentDetail.status === 'Confirmed' && (
                                        <div className="bg-gray-50 rounded-lg p-4 border-t-2 border-green-500">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleCancelClick()}
                                                    disabled={updatingStatus}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    {updatingStatus ? (
                                                        <>
                                                            <Loader2 className="animate-spin h-5 w-5" />
                                                            <span>Đang xử lý...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-5 w-5" />
                                                            <span>Hủy lịch hẹn</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Hiển thị danh sách appointments trong ngày
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full">
                <div className="bg-gray-50 p-6 text-center border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {customerKeys.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">Không có lịch hẹn nào trong ngày</p>
                    ) : (
                        customerKeys.map(customerKey => {
                            const customerData = grouped[customerKey];
                            const custAppts = customerData.apts;
                            const totalPets = custAppts.reduce((s, a) => s + (a.pet_ids?.length || 0), 0);
                            // Lấy appointment đầu tiên để click vào xem chi tiết
                            const firstApt = custAppts[0];
                            const firstAptId = firstApt?.id || firstApt?._id;
                            
                            return (
                                <div
                                    key={customerKey}
                                    onClick={() => firstAptId && handleAppointmentClick(firstAptId)}
                                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-teal-500 hover:shadow-md cursor-pointer transition-all group relative"
                                    title={customerData.customerName}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-900">Đơn {customerData.order}</h4>
                                            <p className="text-gray-600">
                                                {custAppts.length} lịch hẹn • {totalPets} thú cưng
                                            </p>
                                        </div>
                                        <ChevronRight className="text-gray-400" />
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                                        {customerData.customerName}
                                        <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    // Table View - ĐÃ CHỈNH SỬA THEO YÊU CẦU
    const TableView = () => {
        const [updatingId, setUpdatingId] = useState<string | null>(null);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ngày
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ca
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Người tạo
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="animate-spin h-6 w-6 text-teal-600 mr-2" />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Không có lịch hẹn nào phù hợp
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((apt) => {
                                    // Ưu tiên dùng id, nếu không có thì dùng _id
                                    const id = apt.id || apt._id;

                                    return (
                                        <tr 
                                            key={id} 
                                            className="hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => handleRowClick(id, apt.date)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(apt.date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {getShiftLabel(apt.shift)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs border font-medium ${getStatusColor(
                                                        apt.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(apt.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${apt.created_by === "customer"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-teal-100 text-teal-800"
                                                        }`}
                                                >
                                                    {apt.created_by === "customer" ? "Khách" : "Đối tác"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    {apt.status === "Pending_Confirmation" && (
                                                        <>
                                                            {/* Nút Xác nhận */}
                                                            <button
                                                                onClick={() => {
                                                                    setUpdatingId(id);
                                                                    handleUpdateStatus(id, "Confirmed").finally(() =>
                                                                        setUpdatingId(null)
                                                                    );
                                                                }}
                                                                disabled={updatingId === id || loading}
                                                                className="group relative"
                                                                title="Xác nhận lịch hẹn"
                                                            >
                                                                {updatingId === id ? (
                                                                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="h-5 w-5 text-green-600 hover:text-green-700 transition" />
                                                                )}
                                                            </button>

                                                            {/* Nút Hủy */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCancelClick(id);
                                                                }}
                                                                disabled={updatingId === id || loading}
                                                                className="group relative"
                                                                title="Hủy lịch hẹn"
                                                            >
                                                                <XCircle className="h-5 w-5 text-red-600 hover:text-red-700 transition" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {apt.status === "Confirmed" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelClick(id);
                                                            }}
                                                            disabled={updatingId === id || loading}
                                                            className="group relative"
                                                            title="Hủy lịch hẹn"
                                                        >
                                                            <XCircle className="h-5 w-5 text-red-600 hover:text-red-700 transition" />
                                                        </button>
                                                    )}

                                                    {apt.status === "Cancelled" && (
                                                        <span className="text-gray-400 text-xs">Đã hủy</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="text-sm text-gray-700">
                            Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                            <span className="mx-2">•</span>
                            Tổng <span className="font-medium">{total}</span> lịch hẹn
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1 || loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-sm font-medium"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-sm font-medium"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getViewTitle = () => {
        if (viewMode === 'month') {
            return currentDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
        }
        if (viewMode === 'week') {
            const days = getWeekDays();
            return `${days[0].getDate()}/${days[0].getMonth() + 1} - ${days[6].getDate()}/${days[6].getMonth() + 1}, ${currentDate.getFullYear()}`;
        }
        if (viewMode === 'day') {
            return currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
        return 'Danh sách lịch hẹn';
    };

    const getCurrentDateDisplay = () => {
        return new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="w-full">
            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Danh sách lịch hẹn</h1>
                            <p className="mt-1 text-sm md:text-base text-gray-600">{getCurrentDateDisplay()}</p>
                        </div>
                        <NotificationBell notificationCount={1} />
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigateDate('prev')}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => navigateDate('next')}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Hôm nay
                            </button>
                            <button
                                onClick={() => loadAppointments()}
                                disabled={loading}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Làm mới danh sách"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <div className="min-w-0">
                                <p className="text-sm md:text-base text-gray-700 font-medium">{getViewTitle()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {(['month', 'week', 'day', 'table'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setViewMode(mode);
                                        if (mode !== 'day') setSelectedCustomer(null);
                                        if (mode === 'table') {
                                            setPage(1); // Reset về trang 1 khi chuyển sang table view
                                        }
                                    }}
                                    className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-colors font-medium text-sm ${viewMode === mode
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {mode === 'table' && <Filter size={16} className="md:w-[18px] md:h-[18px]" />}
                                    {mode === 'month' && <Calendar size={16} className="md:w-[18px] md:h-[18px]" />}
                                    {mode === 'month' && <span className="hidden sm:inline">Tháng</span>}
                                    {mode === 'week' && <span className="hidden sm:inline">Tuần</span>}
                                    {mode === 'day' && <span className="hidden sm:inline">Ngày</span>}
                                    {mode === 'table' && <span className="hidden sm:inline">Bảng</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Bộ lọc */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                            <Filter size={20} /> Bộ lọc
                        </h2>
                        <button
                            onClick={resetFilters}
                            className="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1 font-medium"
                        >
                            <X size={16} /> Xóa bộ lọc
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Tìm kiếm</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                                placeholder="Tìm kiếm theo ID (chính xác) hoặc tên khách hàng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Trạng thái</label>
                            <select
                                value={filters.status}
                                onChange={e => setFilters({ ...filters, status: e.target.value as any })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            >
                                <option value="all">Tất cả</option>
                                <option value="Confirmed">Đã xác nhận</option>
                                <option value="Pending_Confirmation">Chờ xác nhận</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Từ ngày</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Đến ngày</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Người tạo</label>
                            <select
                                value={filters.createdBy}
                                onChange={e => setFilters({ ...filters, createdBy: e.target.value as any })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            >
                                <option value="all">Tất cả</option>
                                <option value="customer">Khách hàng</option>
                                <option value="partner">Đối tác</option>
                            </select>
                        </div>
                    </div>

                    {/* Hiển thị các bộ lọc đang áp dụng */}
                    {(filters.status !== 'all' || filters.dateFrom || filters.dateTo || filters.createdBy !== 'all' || searchQuery.trim()) && (
                        <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                                <Filter className="w-4 h-4 text-teal-600 mt-0.5" />
                                <span className="text-sm font-medium text-teal-900">Đang lọc theo:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.status !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                        Trạng thái: {getStatusLabel(filters.status)}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                                            className="hover:text-teal-900"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.dateFrom && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                        Từ: {formatDate(filters.dateFrom)}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, dateFrom: '' }))}
                                            className="hover:text-teal-900"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.dateTo && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                        Đến: {formatDate(filters.dateTo)}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, dateTo: '' }))}
                                            className="hover:text-teal-900"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.createdBy !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                        Người tạo: {filters.createdBy === 'customer' ? 'Khách hàng' : 'Đối tác'}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, createdBy: 'all' }))}
                                            className="hover:text-teal-900"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {searchQuery.trim() && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                        Tìm kiếm: {searchQuery}
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="hover:text-teal-900"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        <div className="flex flex-col gap-3">
                            <div>
                                Hiển thị <strong className="text-gray-900">{filteredAppointments.length}</strong> / <strong className="text-gray-900">{total}</strong> lịch hẹn
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-black-700">Chú thích:</span>
                                    <div className="flex items-center gap-1">
                                        <Sun className="w-5 h-5 text-black-500" />
                                        <span className="text-black-500">Sáng</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-700">
                                        <Sunset className="w-5 h-5 text-black-500" />
                                        <span>Chiều</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-700">
                                        <Moon className="w-5 h-5 text-black-500" />
                                        <span>Tối</span>
                                    </div>
                                    <span className="mx-1">•</span>
                                    <span className="text-gray-700">Màu sắc tượng trưng cho 1 khách hàng</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-3 h-3 rounded-full bg-purple-100 mr-1 text-gray-700"></span>
                                    <span className="text-gray-700">Khách = Khách hàng tạo</span>
                                    <span className="inline-block w-3 h-3 rounded-full bg-teal-100 mr-1 ml-3 text-gray-700"></span>
                                    <span className="text-gray-700">Đối tác = Phòng khám tạo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nội dung */}
                {viewMode === 'month' && <MonthView />}
                {viewMode === 'week' && <WeekView />}
                {viewMode === 'day' && <DayView />}
                {viewMode === 'table' && <TableView />}
            </div>

            {/* Modal nhập lý do hủy */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Hủy lịch hẹn</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Vui lòng nhập lý do hủy lịch hẹn này:
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Nhập lý do hủy..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={4}
                            />
                            {error && (
                                <p className="text-sm text-red-600 mt-2">{error}</p>
                            )}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                        setCancellingAppointmentId(null);
                                        setError(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={updatingStatus || !cancelReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {updatingStatus ? 'Đang xử lý...' : 'Xác nhận hủy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}