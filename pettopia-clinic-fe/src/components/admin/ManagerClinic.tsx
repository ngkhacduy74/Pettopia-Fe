'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import {
  findAllClinics,
  activateClinic,
  deactivateClinic,
  type ClinicItem,
} from '@/services/partner/clinicService';
import ToastItem, { type Toast as ToastModel } from '@/components/Toast';

interface ClinicView {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
}

export default function ManagerClinic() {
  const router = useRouter();
  const [clinics, setClinics] = useState<ClinicView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicView | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'deactivate'>('activate');

  const loadClinics = async (page = 1) => {
    try {
      const res = await findAllClinics(page, itemsPerPage, searchTerm || undefined);
      const items = res.data || [];
      const mapped: ClinicView[] = items.map((it: ClinicItem) => ({
        id: it.id,
        name: it.clinic_name,
        address: `${it.address.detail || ''}${it.address.ward ? ', ' + it.address.ward : ''}${it.address.district ? ', ' + it.address.district : ''}${it.address.city ? ', ' + it.address.city : ''}`,
        phone: it.phone?.phone_number || '',
        email: it.email?.email_address || '',
        status: it.is_active ? 'active' : 'inactive',
      }));

      setClinics(mapped);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Load clinics error', err);
      setClinics([]);
      pushToast('Không thể tải danh sách phòng khám', 'error');
    }
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastModel[]>([]);
  const pushToast = (message: string, type: ToastModel['type'] = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    setToasts((t) => [...t, { id, message, type, duration }]);
  };
  const removeToast = (id: string) => setToasts((t) => t.filter(x => x.id !== id));

  useEffect(() => {
    loadClinics(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleStatusChange = (clinic: ClinicView) => {
    setSelectedClinic(clinic);
    setActionType(clinic.status === 'active' ? 'deactivate' : 'activate');
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedClinic) return;

    try {
      if (actionType === 'activate') {
        await activateClinic(selectedClinic.id);
        pushToast('Đã kích hoạt phòng khám thành công', 'success');
      } else {
        await deactivateClinic(selectedClinic.id);
        pushToast('Đã ngừng hoạt động phòng khám', 'success');
      }
      setShowConfirmModal(false);
      setSelectedClinic(null);
      loadClinics(currentPage);
    } catch (err) {
      console.error(err);
      pushToast('Không thể thay đổi trạng thái', 'error');
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmModal(false);
    setSelectedClinic(null);
  };

  // Filter + pagination client-side for search
  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClinics = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              onClick={() => { /* reserved for later */ }}
            >
              Duyệt phòng khám
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng số phòng khám</p>
              <p className="text-3xl font-bold text-gray-900">{clinics.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600">{clinics.filter(c => c.status === 'active').length}</p>
            </div>     
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngừng hoạt động</p>
              <p className="text-3xl font-bold text-red-600">{clinics.filter(c => c.status === 'inactive').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phòng khám
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedClinics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy phòng khám nào
                  </td>
                </tr>
              ) : (
                paginatedClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/clinic/${clinic.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div>
                          <p className="font-semibold text-gray-900">{clinic.name}</p>
                          <p className="text-sm text-gray-500">{clinic.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        
                        {clinic.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600 max-w-md">
                        
                        <span className="line-clamp-2">{clinic.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${clinic.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {clinic.status === 'active' ? 'Active' : 'Inactive'}
                        </span>

                        <label className="inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={clinic.status === 'active'}
                            onChange={() => handleStatusChange(clinic)}
                          />
                          <div className={`w-10 h-5 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-teal-300 ${clinic.status === 'active' ? 'bg-teal-500' : 'bg-gray-200'
                            }`}>
                            <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${clinic.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                          </div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                ? 'bg-teal-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedClinic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${actionType === 'activate' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {actionType === 'activate' ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                ) : (
                  <XMarkIcon className="w-8 h-8 text-red-600" />
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {actionType === 'activate' ? 'Kích hoạt phòng khám?' : 'Ngừng hoạt động phòng khám?'}
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn {actionType === 'activate' ? 'kích hoạt' : 'ngừng hoạt động'} phòng khám{' '}
              <span className="font-semibold">{selectedClinic.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelStatusChange}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-6 py-3 text-white rounded-lg transition-all font-medium ${actionType === 'activate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
}