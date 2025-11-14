'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Filter, ChevronLeft, ChevronRight, X, CheckCircle, XCircle, Clock, Loader2, Sun, Sunset, Moon } from 'lucide-react';
import { getAppointments, updateAppointmentStatus, type AppointmentData } from '@/services/partner/clinicService';
import { getCustomerById } from '@/services/customer/customerService';

// Helper: chuẩn hóa ngày về YYYY-MM-DD (không bị lệch múi giờ)
const toDateKey = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

// Interface mở rộng cho appointment với thông tin customer
interface ExtendedAppointment extends AppointmentData {
  customer_name?: string;
  pet_names?: string[];
  time?: string;
}

export default function AppointmentsPage() {
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

  // Filters
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'Confirmed' | 'Pending_Confirmation' | 'Cancelled',
    dateFrom: '',
    dateTo: '',
    createdBy: 'all' as 'all' | 'customer' | 'partner'
  });

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
                if (customerData?.data?.fullname) {
                  enriched.customer_name = customerData.data.fullname;
                } else {
                  enriched.customer_name = `Khách hàng ${customerId.substring(0, 8)}`;
                }
              } catch (err) {
                // Nếu không lấy được, dùng ID
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

  // Lọc dữ liệu
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(a => {
        const aptDate = toDateKey(new Date(a.date));
        return aptDate >= filters.dateFrom;
      });
    }
    if (filters.dateTo) {
      filtered = filtered.filter(a => {
        const aptDate = toDateKey(new Date(a.date));
        return aptDate <= filters.dateTo;
      });
    }
    if (filters.createdBy !== 'all') {
      filtered = filtered.filter(a => a.created_by === filters.createdBy);
    }
    return filtered;
  }, [appointments, filters]);

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
      case 'morning': return <Sun className="w-3 h-3" />;
      case 'afternoon': return <Sunset className="w-3 h-3" />;
      case 'evening': return <Moon className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const resetFilters = () => {
    setFilters({ status: 'all', dateFrom: '', dateTo: '', createdBy: 'all' });
  };

  // Cập nhật trạng thái appointment
  const handleUpdateStatus = async (appointmentId: string, newStatus: string, cancelReason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await updateAppointmentStatus(appointmentId, newStatus, cancelReason);
      await loadAppointments();
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật trạng thái lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

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
                className={`min-h-[100px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-gray-200 last:border-r-0 ${
                  !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-50 transition-colors`}
              >
                <div
                  className={`text-sm font-medium mb-1 w-8 h-8 flex items-center justify-center rounded-full ${
                    toDateKey(day.date) === todayKey
                      ? 'bg-teal-600 text-white'
                      : day.isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {day.date.getDate()}
                </div>
                <div className="space-y-1 text-xs">
                  {displayed.map(apt => (
                    <div
                      key={apt._id || apt.id}
                      onClick={() => setDateFilterAndSwitchToTable(day.date)}
                      className={`${getCustomerColor(apt.customer || apt.user_id, apt.customer_name)} text-white px-2 py-1 rounded-lg cursor-pointer truncate transition-colors flex items-center gap-1.5`}
                    >
                      <span className="flex-shrink-0">{getShiftIcon(apt.shift)}</span>
                      <span className="truncate">{apt.customer_name || 'Khách hàng'}</span>
                    </div>
                  ))}
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
                  <div className={`text-lg font-bold ${
                    toDateKey(date) === toDateKey(new Date())
                      ? 'bg-teal-600 text-white w-9 h-9 rounded-full flex items-center justify-center mx-auto'
                      : ''
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="p-3 space-y-2 min-h-96">
                  {displayed.map(apt => (
                    <div
                      key={apt._id || apt.id}
                      className={`${getCustomerColor(apt.customer || apt.user_id, apt.customer_name)} text-white p-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-2`}
                    >
                      <span className="flex-shrink-0">{getShiftIcon(apt.shift)}</span>
                      <div className="font-medium truncate">{apt.customer_name || 'Khách hàng'}</div>
                    </div>
                  ))}
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
    const grouped = appts.reduce((acc, apt) => {
      const customerName = apt.customer_name || 'Khách hàng';
      acc[customerName] = acc[customerName] || [];
      acc[customerName].push(apt);
      return acc;
    }, {} as Record<string, typeof appts>);

    const customers = Object.keys(grouped);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full">
        <div className="bg-gray-50 p-6 text-center border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {selectedCustomer ? (
          <div className="p-6">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="mb-4 text-teal-600 hover:text-teal-800 flex items-center gap-2 font-medium"
            >
              <ChevronLeft size={18} /> Quay lại
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900">{selectedCustomer}</h3>
            <div className="space-y-4">
              {grouped[selectedCustomer].map(apt => (
                <div key={apt._id || apt.id} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-5 rounded-xl shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold">{apt.time || 'N/A'}</div>
                      <div className="mt-1 opacity-90">
                        Ca {getShiftLabel(apt.shift)} • {apt.pet_ids?.length || 0} thú cưng
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {customers.length === 0 ? (
              <p className="text-center text-gray-500 py-12">Không có lịch hẹn nào trong ngày</p>
            ) : (
              customers.map(customer => {
                const custAppts = grouped[customer];
                const totalPets = custAppts.reduce((s, a) => s + (a.pet_ids?.length || 0), 0);
                return (
                  <div
                    key={customer}
                    onClick={() => setSelectedCustomer(customer)}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-teal-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{customer}</h4>
                        <p className="text-gray-600">
                          {custAppts.length} lịch hẹn • {totalPets} thú cưng
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
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
                const id = apt._id || apt.id;

                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
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
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.created_by === "customer"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {apt.created_by === "customer" ? "Khách" : "Đối tác"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
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
                              onClick={() => {
                                setUpdatingId(id);
                                handleUpdateStatus(id, "Cancelled").finally(() =>
                                  setUpdatingId(null)
                                );
                              }}
                              disabled={updatingId === id || loading}
                              className="group relative"
                              title="Hủy lịch hẹn"
                            >
                              {updatingId === id ? (
                                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 hover:text-red-700 transition" />
                              )}
                            </button>
                          </>
                        )}

                        {apt.status === "Confirmed" && (
                          <button
                            onClick={() => {
                              setUpdatingId(id);
                              handleUpdateStatus(id, "Cancelled").finally(() =>
                                setUpdatingId(null)
                              );
                            }}
                            disabled={updatingId === id || loading}
                            className="group relative"
                            title="Hủy lịch hẹn"
                          >
                            {updatingId === id ? (
                              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 hover:text-red-700 transition" />
                            )}
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
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Danh sách lịch hẹn</h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">{getCurrentDateDisplay()}</p>
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
                className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-colors font-medium text-sm ${
                  viewMode === mode
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

          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <div className="flex flex-col gap-3">
              <div>
                Hiển thị <strong className="text-gray-900">{filteredAppointments.length}</strong> / <strong className="text-gray-900">{total}</strong> lịch hẹn
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-700">Chú thích:</span>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span className="text-gray-700">Sáng</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Sunset className="w-3 h-3 text-orange-500" />
                    <span>Chiều</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Moon className="w-3 h-3 text-purple-500" />
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
    </div>
  );
}