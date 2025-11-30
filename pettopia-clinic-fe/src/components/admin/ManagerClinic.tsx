'use client';

import React, { useEffect, useState } from 'react';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import {
  findAllClinics,
  getClinicDetail,
  activateClinic,
  deactivateClinic,
  registerClinic,
  updateClinic,
  removeClinic,
  type ClinicItem,
} from '@/services/partner/clinicService';

interface ClinicView {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  openTime?: string;
  closeTime?: string;
  services: string[];
  status: 'active' | 'inactive';
}

export default function ManagerClinic() {
  const [clinics, setClinics] = useState<ClinicView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentClinic, setCurrentClinic] = useState<ClinicView | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    openTime: '',
    closeTime: '',
    services: '',
    status: 'active' as 'active' | 'inactive',
  });

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
        openTime: undefined,
        closeTime: undefined,
        services: [],
        status: it.is_active ? 'active' : 'inactive',
      }));

      setClinics(mapped);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Load clinics error', err);
      setClinics([]);
    }
  };

  useEffect(() => {
    loadClinics(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const openModal = async (mode: 'add' | 'edit', clinicId?: string) => {
    setModalMode(mode);
    if (mode === 'edit' && clinicId) {
      try {
        const res = await getClinicDetail(clinicId);
        const it = res.data;
        setCurrentClinic({
          id: it.id,
          name: it.clinic_name,
          address: `${it.address.detail || ''}${it.address.ward ? ', ' + it.address.ward : ''}${it.address.district ? ', ' + it.address.district : ''}${it.address.city ? ', ' + it.address.city : ''}`,
          phone: it.phone?.phone_number || '',
          email: it.email?.email_address || '',
          openTime: undefined,
          closeTime: undefined,
          services: it.representative?.responsible_licenses || [],
          status: it.is_active ? 'active' : 'inactive',
        });

        setFormData({
          name: it.clinic_name || '',
          address: it.address?.detail || '',
          phone: it.phone?.phone_number || '',
          email: it.email?.email_address || '',
          openTime: '',
          closeTime: '',
          services: (it.representative?.responsible_licenses || []).join(', '),
          status: it.is_active ? 'active' : 'inactive',
        });
      } catch (err) {
        alert('Không thể tải chi tiết phòng khám');
        return;
      }
    } else {
      setCurrentClinic(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        openTime: '',
        closeTime: '',
        services: '',
        status: 'active',
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentClinic(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const payload: any = {
      clinic_name: formData.name,
      address: {
        detail: formData.address,
        city: '',
        district: '',
        ward: '',
      },
      phone: { phone_number: formData.phone },
      email: { email_address: formData.email },
      representative: {
        responsible_licenses: formData.services.split(',').map(s => s.trim()).filter(Boolean),
      },
      is_active: formData.status === 'active',
    };

    try {
      if (modalMode === 'add') {
        await registerClinic(payload as any);
        alert('Thêm phòng khám thành công');
      } else if (modalMode === 'edit' && currentClinic) {
        await updateClinic(currentClinic.id, payload);
        alert('Cập nhật phòng khám thành công');
      }
      closeModal();
      loadClinics(currentPage);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Có lỗi khi lưu phòng khám');
    }
  };

  const handleDelete = async (clinicId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng khám này?')) return;
    try {
      await removeClinic(clinicId);
      alert('Xóa thành công');
      loadClinics(currentPage);
    } catch (err: any) {
      console.error(err);
      alert('Không thể xóa phòng khám');
    }
  };

  const toggleActive = async (clinicId: string, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await deactivateClinic(clinicId);
      } else {
        await activateClinic(clinicId);
      }
      loadClinics(currentPage);
    } catch (err) {
      alert('Không thể thay đổi trạng thái');
    }
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div>
            </div>
          </div>
          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm phòng khám
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng số phòng khám</p>
              <p className="text-3xl font-bold text-gray-900">{clinics.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600">{clinics.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngừng hoạt động</p>
              <p className="text-3xl font-bold text-red-600">{clinics.filter(c => c.status === 'inactive').length}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <XMarkIcon className="w-7 h-7 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedClinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="h-40 bg-gradient-to-br from-teal-400 to-cyan-500 relative">
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  clinic.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {clinic.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <BuildingOfficeIcon className="w-8 h-8 text-teal-600" />
                </div>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{clinic.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{clinic.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{clinic.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{clinic.openTime || '-'} - {clinic.closeTime || '-'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Dịch vụ:</p>
                <div className="flex flex-wrap gap-1.5">
                  {clinic.services.map((service, idx) => (
                    <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal('edit', clinic.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <PencilIcon className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(clinic.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <TrashIcon className="w-4 h-4" />
                  Xóa
                </button>
                <button
                  onClick={() => toggleActive(clinic.id, clinic.status === 'active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${clinic.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {clinic.status === 'active' ? 'Ngừng' : 'Kích hoạt'}
                </button>
              </div>
            </div>
          </div>
        ))}
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
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === page
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Thêm phòng khám mới' : 'Chỉnh sửa phòng khám'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên phòng khám *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập tên phòng khám"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="0xx xxx xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ mở cửa (không bắt buộc)
                  </label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ đóng cửa (không bắt buộc)
                  </label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dịch vụ (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Khám tổng quát, Nha khoa, Da liễu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {modalMode === 'add' ? 'Thêm phòng khám' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}