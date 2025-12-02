'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

import { getCustomerById, updateCustomerStatus } from '@/services/customer/customerService';
import ToastItem, { type Toast as ToastModel } from '@/components/Toast';

interface UserDetailProps {
  id: string;
}

export default function UserDetail({ id }: UserDetailProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [toasts, setToasts] = useState<ToastModel[]>([]);
  const pushToast = (message: string, type: ToastModel['type'] = 'info', duration = 3000) => {
    const toastId = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    setToasts((t) => [...t, { id: toastId, message, type, duration }]);
  };
  const removeToast = (toastId: string) => setToasts((t) => t.filter(x => x.id !== toastId));

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCustomerById(id);
        if (mounted) {
          setCustomer(res.data || res);
          setEditableData(JSON.parse(JSON.stringify(res.data || res)));
        }
      } catch (err) {
        console.error('Error loading customer detail', err);
        if (mounted) {
          setError('Không thể tải chi tiết khách hàng');
          pushToast('Không thể tải chi tiết khách hàng', 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false };
  }, [id]);

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
    setCustomer(editableData);
    setIsEditing(false);
    pushToast('Cập nhật thông tin thành công', 'success');
    console.log('Saved (local):', editableData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableData(customer ? JSON.parse(JSON.stringify(customer)) : null);
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    
    try {
      setIsUpdatingStatus(true);
      const newStatus = customer.is_active ? 'deactive' : 'active';
      await updateCustomerStatus(customer.id, newStatus);
      
      // Update local state
      const updatedCustomer = {
        ...customer,
        is_active: !customer.is_active
      };
      setCustomer(updatedCustomer);
      setEditableData(updatedCustomer);
      
      pushToast(`Trạng thái đã ${newStatus === 'active' ? 'kích hoạt' : 'đình chỉ'}`, 'success');
      console.log('Trạng thái đã cập nhật:', newStatus);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      pushToast('Cập nhật trạng thái thất bại', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error || 'Không tìm thấy khách hàng'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Quay lại
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{customer.fullname}</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                customer.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {customer.is_active ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Đang hoạt động
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    Ngừng hoạt động
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={handleToggleStatus}
                  disabled={isUpdatingStatus}
                  className={`px-4 py-2 rounded-xl text-white transition-all duration-200 font-medium ${
                    customer.is_active
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
                  }`}
                >
                  {isUpdatingStatus 
                    ? 'Đang cập nhật...' 
                    : customer.is_active 
                      ? 'Đình chỉ tài khoản' 
                      : 'Kích hoạt tài khoản'}
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow transition-all duration-200 font-medium"
                >
                  Lưu
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl shadow transition-all duration-200 font-medium"
                >
                  Huỷ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* ID Card */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
            <p className="text-teal-100 text-sm mb-2">ID Khách hàng</p>
            <p className="text-lg font-bold font-mono break-all leading-relaxed">{customer.id}</p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-teal-600" />
              Thông tin liên hệ
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-medium">{customer.fullname}</p>
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-gray-900 font-medium"
                      value={editableData.fullname ?? ''}
                      onChange={(e) => handleInputChange('fullname', e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IdentificationIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Tên đăng nhập</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-medium">{customer.username}</p>
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-gray-900 font-medium"
                      value={editableData.username ?? ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-medium">{customer.email?.email_address || '-'}</p>
                  ) : (
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2 text-gray-900 font-medium"
                      value={editableData.email?.email_address ?? ''}
                      onChange={(e) => handleInputChange('email', e.target.value, 'email_address')}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-medium">{customer.phone?.phone_number || '-'}</p>
                  ) : (
                    <input
                      type="tel"
                      className="w-full border rounded px-3 py-2 text-gray-900 font-medium"
                      value={editableData.phone?.phone_number ?? ''}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'phone_number')}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                  {!isEditing ? (
                    <p className="text-gray-900">{customer.address ? `${customer.address.description || ''}, ${customer.address.ward || ''}, ${customer.address.district || ''}, ${customer.address.city || ''}` : '-'}</p>
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-gray-900"
                      value={editableData.address?.description ?? ''}
                      onChange={(e) => handleInputChange('address', e.target.value, 'description')}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Điểm uy tín</p>
                {!isEditing ? (
                  <p className="text-gray-900 font-medium text-lg">{customer.reward_point ?? 0}</p>
                ) : (
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-gray-900 font-medium"
                    value={editableData.reward_point ?? 0}
                    onChange={(e) => handleInputChange('reward_point', Number(e.target.value))}
                  />
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày sinh</p>
                {!isEditing ? (
                  <p className="text-gray-900 font-medium">{customer.dob ? new Date(customer.dob).toLocaleDateString('vi-VN') : 'Chưa có'}</p>
                ) : (
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={editableData.dob ? new Date(editableData.dob).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dob', new Date(e.target.value))}
                  />
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Quyền hạn</p>
              {!isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(customer.role) && customer.role.length > 0 ? (
                    customer.role.map((r: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm italic">Không có quyền</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {['Admin', 'Staff', 'Clinic', 'Vet', 'User'].map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        const roles = editableData.role || [];
                        if (roles.includes(role)) {
                          setEditableData({ ...editableData, role: roles.filter((r: string) => r !== role) });
                        } else {
                          setEditableData({ ...editableData, role: [...roles, role] });
                        }
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                        (editableData.role || []).includes(role)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Trạng thái</span>
                <span className={`text-sm font-semibold ${
                  customer.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Điểm uy tín</span>
                <span className="text-sm font-semibold text-gray-900">
                  {customer.reward_point ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Quyền hạn</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Array.isArray(customer.role) ? customer.role.length : 0}
                </span>
              </div>

              {customer.createdAt && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Ngày tạo</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
}
