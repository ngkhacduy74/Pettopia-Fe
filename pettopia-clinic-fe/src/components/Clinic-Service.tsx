'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { getClinicServices, createClinicService, updateClinicService } from '../services/partner/clinicService';

interface Service {
  _id?: string;
  id?: string;
  clinic_id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
}

export default function ClinicService() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const [form, setForm] = useState<Service>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    is_active: true,
  });

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getClinicServices(page, limit);
      setServices(res.data || []);
      const inferredTotal = res.pagination?.total ?? (res as any).total ?? (res.data?.length || 0);
      setTotal(inferredTotal);
    } catch (e: any) {
      setError(e?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Service name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingId && form.id) {
        await updateClinicService(form.id, form);
      } else {
        await createClinicService(form);
      }
      await load();
      resetForm();
      setIsModalOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      is_active: true,
    });
    setEditingId(null);
    setError(null);
  }

  function openModal(service?: Service) {
    if (service) {
      setForm({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        is_active: service.is_active,
      });
      setEditingId(service.id || service._id || null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Dịch vụ</h1>
            <p className="mt-2 text-gray-600">Thêm mới và chỉnh sửa các dịch vụ của phòng khám</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-teal-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 transition flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm dịch vụ
          </button>
        </div>

        {/* Error Alert */}
        {error && !isModalOpen && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách dịch vụ</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên dịch vụ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá tiền
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && services.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">Chưa có dịch vụ nào</p>
                        <p className="text-sm text-gray-400 mt-1">Thêm dịch vụ đầu tiên của bạn</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  services.map((s, idx) => {
                    const serviceKey = s._id || s.id || idx;
                    return (
                      <tr
                        key={serviceKey}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div
                            className="text-sm font-medium text-gray-900 relative inline-block cursor-help"
                            onMouseEnter={() => setHoveredService(String(serviceKey))}
                            onMouseLeave={() => setHoveredService(null)}
                          >
                            {s.name}
                            {s.description && hoveredService === String(serviceKey) && (
                              <div className="absolute z-50 left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 whitespace-normal">
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                {s.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(s.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-700">{s.duration} phút</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {s.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="text-teal-600 hover:text-teal-900 font-medium text-sm transition"
                            onClick={() => openModal(s)}
                          >
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {services.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  Trước
                </button>
                <button
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                    <span className="mx-2">•</span>
                    Tổng <span className="font-medium">{total}</span> dịch vụ
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || loading}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || loading}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error Alert in Modal */}
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition pointer-events-auto"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Khám tổng quát"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả chi tiết về dịch vụ..."
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá tiền (VND) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      min={0}
                      step={1000}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      min={5}
                      step={5}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">phút</span>
                  </div>
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-teal-600 focus:ring-2 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Kích hoạt dịch vụ</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-gray-50 sticky bottom-0">
              <button
                type="button"
                onClick={closeModal}
                className="bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-2.5 font-medium hover:bg-gray-50 transition"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-teal-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}