'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { Sun, Sunset, Moon, Clock, Edit, Trash2, Loader2 } from 'lucide-react';

// API Configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/clinic/shift`;
const getToken = () => localStorage.getItem('authToken') || '';

// API Services
const getClinicShifts = async (page: number, limit: number) => {
  const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': getToken()
    }
  });
  if (!response.ok) throw new Error('Không thể tải danh sách ca làm việc');
  return response.json();
};

const createClinicShift = async (shift: Omit<ClinicShift, 'id' | 'is_active'>) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': getToken()
    },
    body: JSON.stringify(shift)
  });
  if (!response.ok) throw new Error('Không thể tạo ca làm việc');
  return response.json();
};

const updateClinicShift = async (id: string, shift: Omit<ClinicShift, 'id' | 'is_active'>) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'token': getToken()
    },
    body: JSON.stringify(shift)
  });
  if (!response.ok) throw new Error('Không thể cập nhật ca làm việc');
  return response.json();
};

const deleteClinicShift = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'token': getToken()
    }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể xóa ca làm việc');
  }
  return response.json();
};

interface ClinicShift {
  id?: string;
  shift: string;
  max_slot: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export default function ClinicShift() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ClinicShift[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingIdAction, setEditingIdAction] = useState<string | undefined>(undefined);
  const [deletingIdAction, setDeletingIdAction] = useState<string | undefined>(undefined);

  const [form, setForm] = useState<ClinicShift>({
    shift: 'Morning',
    max_slot: 50,
    start_time: '07:00',
    end_time: '12:00',
  });

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  async function load() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await getClinicShifts(page, limit);
      setShifts(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải ca làm việc');
      setShifts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  const formatTime24h = (time: string) => {
    return time.padStart(5, '0');
  };

  const handlePeriodClick = (period: 'Sáng' | 'Chiều' | 'Tối') => {
    const config = {
      'Sáng': { shift: 'Morning', start: '07:00', end: '12:00' },
      'Chiều': { shift: 'Afternoon', start: '13:00', end: '18:00' },
      'Tối': { shift: 'Evening', start: '18:00', end: '22:00' },
    }[period];

    setForm({
      ...form,
      shift: config.shift,
      start_time: config.start,
      end_time: config.end,
    });
  };

  const validateTime = (time: string): boolean => {
    return /^\d{2}:\d{2}$/.test(time) &&
      Number(time.split(':')[0]) >= 0 && Number(time.split(':')[0]) <= 23 &&
      Number(time.split(':')[1]) >= 0 && Number(time.split(':')[1]) <= 59;
  };

  const getShiftBoundaries = (shiftType: string) => {
    const boundaries = {
      'Morning': { start: '05:00', end: '12:00' },
      'Afternoon': { start: '12:01', end: '18:00' },
      'Evening': { start: '18:00', end: '23:59' },
    };
    return boundaries[shiftType as keyof typeof boundaries];
  };

  const validateShiftTime = (shift: string, startTime: string, endTime: string): string | null => {
    if (!validateTime(startTime) || !validateTime(endTime)) return 'Giờ không hợp lệ (HH:MM)';

    const boundaries = getShiftBoundaries(shift);
    if (!boundaries) return 'Ca làm việc không hợp lệ';

    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(endTime);
    const boundStart = timeToMinutes(boundaries.start);
    const boundEnd = timeToMinutes(boundaries.end);

    if (startM >= endM) return 'Giờ bắt đầu phải trước giờ kết thúc';
    if (startM < boundStart || startM > boundEnd) return `Giờ bắt đầu phải trong ${boundaries.start} - ${boundaries.end}`;
    if (endM < boundStart || endM > boundEnd) return `Giờ kết thúc phải trong ${boundaries.start} - ${boundaries.end}`;

    return null;
  };

  async function handleSubmit() {
    if (!form.shift.trim()) {
      setError('Tên ca làm việc là bắt buộc');
      return;
    }

    if (form.max_slot > 50) {
      setError('Số slot tối đa không được vượt quá 50');
      return;
    }

    const timeError = validateShiftTime(form.shift, form.start_time, form.end_time);
    if (timeError) {
      setError(timeError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      let response;
      const { id, is_active, ...apiData } = form;

      if (editingId) {
        response = await updateClinicShift(editingId, apiData);
      } else {
        response = await createClinicShift(apiData);
      }
      setSuccessMessage(response.message || 'Lưu ca làm việc thành công');
      await load();
      resetForm();
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'Không thể lưu ca làm việc');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeletingIdAction(deleteId);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteClinicShift(deleteId);
      setSuccessMessage('Xóa ca làm việc thành công');
      await load();
      setIsDeleteModalOpen(false);
      setDeleteId(undefined);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'Không thể xóa ca làm việc');
    } finally {
      setLoading(false);
      setDeletingIdAction(undefined);
    }
  }

  function openModal(shift?: ClinicShift) {
    if (shift) {
      setForm({ ...shift });
      setEditingId(shift.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  function resetForm() {
    setForm({
      shift: 'Morning',
      max_slot: 50,
      start_time: '07:00',
      end_time: '12:00',
    });
    setEditingId(undefined);
    setError(null);
  }

  function openDeleteModal(id: string) {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setDeleteId(undefined);
  }

  const getShiftColor = (shiftName: string) => {
    switch (shiftName.toLowerCase()) {
      case 'morning': return 'bg-amber-100 text-amber-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftIcon = (shiftName: string) => {
    switch (shiftName.toLowerCase()) {
      case 'morning': return <Sun className="w-5 h-5" />;
      case 'afternoon': return <Sunset className="w-5 h-5" />;
      case 'evening': return <Moon className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  type ShiftType = 'Morning' | 'Afternoon' | 'Evening';
  const shiftOrder: Record<ShiftType, number> = {
    'Morning': 1,
    'Afternoon': 2,
    'Evening': 3,
  };

  const sortedShifts = [...shifts].sort((a, b) => {
    const orderA = shiftOrder[a.shift as ShiftType] ?? 99;
    const orderB = shiftOrder[b.shift as ShiftType] ?? 99;
    return orderA - orderB;
  });

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Ca làm việc</h1>
            <p className="mt-2 text-gray-600">Thêm mới và chỉnh sửa các ca làm việc của phòng khám</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-xl px-6 py-3.5 font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm ca làm việc
          </button>
        </div>

        {/* Alerts */}
        {error && !isModalOpen && !isDeleteModalOpen && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{error}</div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">{successMessage}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách ca làm việc</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ca</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Slot</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && shifts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : shifts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Chưa có ca làm việc nào</td></tr>
                ) : (
                  sortedShifts.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">{getShiftIcon(s.shift)}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{s.shift}</div>
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${getShiftColor(s.shift)}`}>
                              {s.shift === 'Morning' ? 'Buổi sáng' : s.shift === 'Afternoon' ? 'Buổi chiều' : 'Buổi tối'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-lg font-bold text-gray-900">{s.max_slot}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-mono text-gray-800">
                        <span className="font-semibold">{formatTime24h(s.start_time)}</span>
                        <span className="mx-3 text-gray-400">→</span>
                        <span className="font-semibold">{formatTime24h(s.end_time)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {s.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => {
                              setEditingIdAction(s.id);
                              openModal(s);
                              setTimeout(() => setEditingIdAction(undefined), 100);
                            }}
                            disabled={loading}
                            className="group relative"
                            title="Chỉnh sửa ca làm việc"
                          >
                            {editingIdAction === s.id ? (
                              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                            ) : (
                              <Edit className="h-5 w-5 text-teal-600 hover:text-teal-800 transition" />
                            )}
                          </button>
                          <button 
                            onClick={() => openDeleteModal(s.id!)} 
                            disabled={loading}
                            className="group relative"
                            title="Xóa ca làm việc"
                          >
                            {deletingIdAction === s.id ? (
                              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800 transition" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {shifts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700 gap-3">
              <span>Trang {page} / {totalPages} • Tổng {total} ca</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">Trước</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">Sau</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              {/* Error */}
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Quick Select */}
              <div className="mb-7">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn nhanh ca</label>
                <div className="flex flex-wrap gap-3">
                  {(['Sáng', 'Chiều', 'Tối'] as const).map((p) => {
                    const isActive = form.shift === (p === 'Sáng' ? 'Morning' : p === 'Chiều' ? 'Afternoon' : 'Evening');
                    return (
                      <button
                        key={p}
                        onClick={() => handlePeriodClick(p)}
                        className={`flex items-center gap-2.5 rounded-xl px-5 py-3 font-medium transition-all ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {p === 'Sáng' && <Sun className="h-5 w-5" />}
                        {p === 'Chiều' && <Sunset className="h-5 w-5" />}
                        {p === 'Tối' && <Moon className="h-5 w-5" />}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên ca làm việc</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition"
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  >
                    <option value="Morning">Morning - Buổi sáng (05:00 → 12:00)</option>
                    <option value="Afternoon">Afternoon - Buổi chiều (12:01 → 18:00)</option>
                    <option value="Evening">Evening - Buổi tối (18:01 → 23:59)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số slot tối đa</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition"
                    value={form.max_slot}
                    onChange={(e) => setForm({ ...form, max_slot: Math.min(50, Number(e.target.value) || 1) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ bắt đầu</label>
                  <input
                    type="text"
                    placeholder="07:00"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 font-mono focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition"
                    value={form.start_time}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9:]/g, '').slice(0, 5);
                      if (v.length === 2 && !v.includes(':')) v += ':';
                      setForm({ ...form, start_time: v });
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v && validateTime(v)) {
                        const [h, m] = v.split(':');
                        setForm({ ...form, start_time: `${h.padStart(2, '0')}:${m?.padStart(2, '0') || '00'}` });
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ kết thúc</label>
                  <input
                    type="text"
                    placeholder="12:00"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 font-mono focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition"
                    value={form.end_time}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9:]/g, '').slice(0, 5);
                      if (v.length === 2 && !v.includes(':')) v += ':';
                      setForm({ ...form, end_time: v });
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v && validateTime(v)) {
                        const [h, m] = v.split(':');
                        setForm({ ...form, end_time: `${h.padStart(2, '0')}:${m?.padStart(2, '0') || '00'}` });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50/80 px-6 py-5">
              <button
                onClick={closeModal}
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl bg-teal-600 px-7 py-3 font-medium text-white shadow-lg shadow-teal-600/30 hover:bg-teal-700 disabled:opacity-60 transition"
              >
                {loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Xóa ca làm việc?</h3>
              <p className="text-gray-600 mb-8">Hành động này không thể hoàn tác. Ca làm việc sẽ bị xóa vĩnh viễn.</p>

              <div className="flex gap-4">
                <button
                  onClick={closeDeleteModal}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-3.5 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-red-600 py-3.5 font-medium text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
                >
                  {loading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}