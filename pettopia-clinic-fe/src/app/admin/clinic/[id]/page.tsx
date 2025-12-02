'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

import { getClinicDetail, type ClinicItem } from '@/services/partner/clinicService';
import ToastItem, { type Toast as ToastModel } from '@/components/Toast';

export default function ClinicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [clinic, setClinic] = useState<ClinicItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
        const res = await getClinicDetail(id);
        if (mounted) setClinic(res.data || null);
      } catch (err) {
        console.error('Error loading clinic detail', err);
        if (mounted) {
          setError('Không thể tải chi tiết phòng khám');
          pushToast('Không thể tải chi tiết phòng khám', 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false };
  }, [id]);

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

  if (error || !clinic) {
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
          <p className="text-red-700 font-medium">{error || 'Không tìm thấy phòng khám'}</p>
        </div>
      </div>
    );
  }

  const fullAddress = `${clinic.address?.detail || ''}${clinic.address?.ward ? ', ' + clinic.address.ward : ''}${clinic.address?.district ? ', ' + clinic.address.district : ''}${clinic.address?.city ? ', ' + clinic.address.city : ''}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{clinic.clinic_name}</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                clinic.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {clinic.is_active ? (
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
            <button
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              onClick={() => {/* Reserved for edit functionality */}}
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* ID Card */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
            <p className="text-teal-100 text-sm mb-2">ID Phòng khám</p>
            <p className="text-lg font-bold font-mono break-all leading-relaxed">{clinic.id}</p>
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
                  <EnvelopeIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{clinic.email?.email_address || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <p className="text-gray-900 font-medium">{clinic.phone?.phone_number || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                  <p className="text-gray-900">{fullAddress || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Representative Information */}
          {clinic.representative && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-teal-600" />
                Thông tin người đại diện
              </h2>
              
              <div className="space-y-4">
                {clinic.representative.name && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IdentificationIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                      <p className="text-gray-900 font-medium">{clinic.representative.name}</p>
                    </div>
                  </div>
                )}

                {clinic.representative.email?.email_address && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 font-medium">{clinic.representative.email.email_address}</p>
                    </div>
                  </div>
                )}

                {clinic.representative.phone?.phone_number && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                      <p className="text-gray-900 font-medium">{clinic.representative.phone.phone_number}</p>
                    </div>
                  </div>
                )}

                {clinic.representative.identify_number && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IdentificationIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Số CMND/CCCD</p>
                      <p className="text-gray-900 font-medium">{clinic.representative.identify_number}</p>
                    </div>
                  </div>
                )}

                {clinic.representative.license_issued_date && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Ngày cấp giấy phép</p>
                      <p className="text-gray-900 font-medium">{new Date(clinic.representative.license_issued_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}

                {clinic.representative.responsible_licenses && clinic.representative.responsible_licenses.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IdentificationIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Giấy phép chịu trách nhiệm</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {clinic.representative.responsible_licenses.map((license, idx) => (
                          <span key={idx} className="inline-flex px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                            {license}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  clinic.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {clinic.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Thông tin liên hệ</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(clinic.email?.email_address && clinic.phone?.phone_number) ? 'Đầy đủ' : 'Chưa đủ'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Người đại diện</span>
                <span className="text-sm font-semibold text-gray-900">
                  {clinic.representative ? 'Có' : 'Chưa có'}
                </span>
              </div>
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