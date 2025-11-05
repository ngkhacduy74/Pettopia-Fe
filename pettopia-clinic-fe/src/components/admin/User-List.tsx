'use client'
import React, { useState, useEffect } from 'react'
import { getCustomerData } from '@/services/customer/customerService';
import Location from '@/utils/location';
import Register from '@/components/auth/RegisterForm';

interface RequestTableProps {
  title: string;
}

export default function RequestTable({ title }: RequestTableProps) {
  const [selectedForm, setSelectedForm] = useState<any | null>(null); // Thay đổi kiểu để phù hợp với dữ liệu mới
  const [dropdownRow, setDropdownRow] = useState<number | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(10);
  const [filterRole, setFilterRole] = useState('all');
  // NOTE: trạng thái modal edit and editable data (mới thêm, chỉ dùng bên trong modal)
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);


  useEffect(() => {
    fetchForms();
  }, [currentPage, filterRole]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const response = await getCustomerData(currentPage, limit);
      setForms(response.items);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesFilter = filterRole === 'all' || form.role.some((r: string) => r.toLowerCase() === filterRole.toLowerCase());
    return matchesFilter;
  });

  const openDetailPage = (form: any) => {
    setSelectedForm(form);
    // NOTE: khởi tạo editableData khi mở modal
    setEditableData(JSON.parse(JSON.stringify(form)));
    setIsEditing(false);
  };

  const closeDetailPage = () => {
    setSelectedForm(null);
    setIsEditing(false);
    setEditableData(null);
  };

  const toggleDropdown = (index: number) => {
    setDropdownRow(dropdownRow === index ? null : index);
  };


  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // NOTE: modal edit handlers (chỉ ảnh hưởng modal, không chạm các phần khác)
  const handleInputChange = (field: string, value: any, nestedField?: string) => {
    if (!editableData) return;
    if (nestedField) {
      setEditableData({
        ...editableData,
        [field]: { ...editableData[field], [nestedField]: value },
      });
    } else {
      setEditableData({
        ...editableData,
        [field]: value,
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editableData) return;
    // cập nhật local list để bảng phản ánh luôn (vẫn giữ nguyên logic gốc, bạn có thể gọi API ở đây)
    setForms(prev => prev.map(f => (f.id === editableData.id ? editableData : f)));
    setSelectedForm(editableData);
    setIsEditing(false);
    // NOTE: nếu cần, gọi API update tại đây
    console.log('Saved (local):', editableData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableData(selectedForm ? JSON.parse(JSON.stringify(selectedForm)) : null);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                {/* NOTE: GIỮ NGUYÊN TITLE VÀ MÀU SẮC */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">{title}</h1>
                <p className="text-gray-600 mt-2">Quản lý thông tin khách hàng</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-2.5 px-5 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Thêm mới</span>
                </button>

              </div>
            </div>

            {/* Filter */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="clinic">Clinic</option>
                <option value="vet">Vet</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium">Không tìm thấy kết quả</p>
                <p className="text-sm mt-1">Thử điều chỉnh bộ lọc vai trò</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-64 max-w-xs">
                      Địa chỉ
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Điểm uy tín
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quyền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.map((form, index) => (
                    <tr
                      key={form.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                      onClick={() => openDetailPage(form)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{form.fullname}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {form.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 012 2z" />
                          </svg>
                          {form.email.email_address}
                        </div>
                        <div className="text-sm text-gray-900 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {form.phone.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 w-64 max-w-xs truncate">
                        {form.address ? `${form.address.description || ''}, ${form.address.ward || ''}, ${form.address.district || ''}, ${form.address.city || ''}` : 'Chưa có thông tin địa chỉ'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {form.reward_point}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(form.role) && form.role.length > 0 ? (
                            form.role.map((r: string, idx: number) => (
                              <span
                                key={idx}
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm italic">Không có quyền</span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && filteredForms.length > 0 && (
            <div className="bg-white px-4 py-4 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-semibold text-indigo-600">{(currentPage - 1) * limit + 1}</span> đến{' '}
                    <span className="font-semibold text-indigo-600">{Math.min(currentPage * limit, filteredForms.length)}</span> trong số{' '}
                    <span className="font-semibold text-indigo-600">{filteredForms.length}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${currentPage === pageNumber
                            ? 'z-10 bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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

      {/* NOTE: replace full-page detail view with simple modal (only this part changed) */}
      {/* NOTE: Updated modal with blur, click-outside close, editable fields */}
      {selectedForm && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetailPage();
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closeDetailPage}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wider font-medium">Chi tiết</p>
                  {!isEditing ? (
                    <h2 className="text-2xl font-bold text-gray-900">{selectedForm.fullname}</h2>
                  ) : (
                    <input
                      className="border rounded px-3 py-2 text-xl font-semibold w-full"
                      value={editableData.fullname ?? ''}
                      onChange={(e) => handleInputChange('fullname', e.target.value)}
                    />
                  )}
                </div>
                <div className="text-right">
                  {!isEditing ? (
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-bold inline-block ${selectedForm.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {selectedForm.is_active ? 'Đã kích hoạt' : 'Đã bị đình chỉ'}
                    </span>
                  ) : (
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={editableData.is_active ? 'active' : 'inactive'}
                      onChange={(e) =>
                        handleInputChange('is_active', e.target.value === 'active')
                      }
                    >
                      <option value="true">Đã kích hoạt</option>
                      <option value="false">Dừng hoạt động</option>
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-2">ID: {selectedForm.id}</p>
                  <p className="text-xs text-gray-500">Ngày tạo: {new Date(selectedForm.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                  {!isEditing ? (
                    <p className="text-gray-900">{selectedForm.username}</p>
                  ) : (
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editableData.username ?? ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  {!isEditing ? (
                    <p className="text-gray-900">{selectedForm.email?.email_address}</p>
                  ) : (
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editableData.email?.email_address ?? ''}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value, 'email_address')
                      }
                    />
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  {!isEditing ? (
                    <p className="text-gray-900">{selectedForm.phone?.phone_number}</p>
                  ) : (
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editableData.phone?.phone_number ?? ''}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value, 'phone_number')
                      }
                    />
                  )}
                </div>

                {/* Reward Point */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm uy tín</label>
                  {!isEditing ? (
                    <p className="text-gray-900">{selectedForm.reward_point}</p>
                  ) : (
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={editableData.reward_point ?? 0}
                      onChange={(e) =>
                        handleInputChange('reward_point', Number(e.target.value))
                      }
                    />
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh</label>
                  {!isEditing ? (
                    <p className="text-gray-900">
                      {selectedForm.dob
                        ? new Date(selectedForm.dob).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </p>
                  ) : (
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={
                        editableData.dob
                          ? new Date(editableData.dob).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange('dob', new Date(e.target.value))
                      }
                    />
                  )}
                </div>

                {/* Address */}
                <div>
                  {!isEditing ? (
                    <p className="text-gray-900">
                      {selectedForm.address
                        ? `${selectedForm.address.description || ''}, ${selectedForm.address.ward || ''}, ${selectedForm.address.district || ''}, ${selectedForm.address.city || ''}`
                        : 'Chưa có thông tin địa chỉ'}
                    </p>
                  ) : (
                    <Location
                      value={editableData.address}
                      onChange={(newAddress) => handleInputChange('address', newAddress)}
                    />
                  )}
                </div>

              </div>

              {/* Action buttons bottom-right */}
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg shadow"
                  >
                    Chỉnh sửa thông tin
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg shadow"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg shadow"
                    >
                      Huỷ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Modal thêm người dùng mới */}
      {
        showRegisterModal && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowRegisterModal(false);
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              {/* Nút đóng */}
              <button
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thêm người dùng mới</h2>

                {/* 🧩 Form đăng ký (Register component) */}
                <Register />

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg shadow"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}