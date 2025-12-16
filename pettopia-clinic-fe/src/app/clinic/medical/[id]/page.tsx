'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, ClipboardList, Pill, FileText, Calendar, Loader2, User, Phone, Mail, MapPin } from 'lucide-react';
import { getAppointmentDetail, getMedicalRecord } from '@/services/partner/clinicService';
import { useToast } from '@/contexts/ToastContext';

interface AppointmentDetail {
  id: string;
  date: string;
  shift: string;
  status: string;
  user_info: {
    fullname: string;
    phone_number: string;
    email?: string;
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

export default function MedicalRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const { showError } = useToast();

  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [hasRecord, setHasRecord] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetail();
      fetchMedicalRecord();
    }
  }, [appointmentId]);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentDetail(appointmentId);
      if (response.status === 'success' && response.data) {
        const detail = response.data as any;
        // Đảm bảo luôn có id
        if (detail._id && !detail.id) {
          detail.id = detail._id;
        }
        setAppointmentDetail(detail as AppointmentDetail);
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy chi tiết appointment:', error);
      showError(error?.response?.data?.message || 'Không thể tải chi tiết lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecord = async () => {
    const response = await getMedicalRecord(appointmentId);
    if (response && response.data) {
      setMedicalRecord(response.data);
      setHasRecord(true);
    } else {
      setHasRecord(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-600">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (!appointmentDetail) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy thông tin lịch hẹn</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-teal-500 hover:text-teal-600 mb-4 font-medium cursor-pointer"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        {/* Thông tin lịch hẹn */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin lịch hẹn</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>{formatDate(appointmentDetail.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Ca:</span>
                <span>{appointmentDetail.shift}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Khách hàng</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} />
                <span>{appointmentDetail.user_info.fullname}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Phone size={16} />
                <span>{appointmentDetail.user_info.phone_number}</span>
              </div>
            </div>

            {appointmentDetail.pet_infos && appointmentDetail.pet_infos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Thú cưng</h3>
                {appointmentDetail.pet_infos.map((pet, index) => (
                  <div key={pet.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="font-medium text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">{pet.species} - {pet.breed}</p>
                  </div>
                ))}
              </div>
            )}

            {appointmentDetail.service_infos && appointmentDetail.service_infos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Dịch vụ</h3>
                {appointmentDetail.service_infos.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hồ sơ bệnh án - Chỉ xem */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-600 mb-1">HỒ SƠ BỆNH ÁN</h1>
                <p className="text-gray-600">Medical Record</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-gray-600 mb-1">
                  <Calendar size={16} />
                  <span>{formatDate(appointmentDetail.date)}</span>
                </div>
                <p className="text-sm text-gray-500">ID: {appointmentDetail.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {!hasRecord ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Chưa có hồ sơ bệnh án</p>
              <p className="text-gray-400 text-sm">Hồ sơ bệnh án sẽ được tạo bởi bác sĩ thú y</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Triệu Chứng */}
              {medicalRecord.symptoms && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="text-red-600" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold">Triệu Chứng</h2>
                  </div>
                  <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{medicalRecord.symptoms}</p>
                  </div>
                </div>
              )}

              {/* Chẩn Đoán */}
              {medicalRecord.diagnosis && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ClipboardList className="text-green-600" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold">Chẩn Đoán</h2>
                  </div>
                  <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{medicalRecord.diagnosis}</p>
                  </div>
                </div>
              )}

              {/* Đơn Thuốc */}
              {medicalRecord.medications && medicalRecord.medications.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Pill className="text-purple-600" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold">Đơn Thuốc</h2>
                  </div>
                  <div className="space-y-3">
                    {medicalRecord.medications.map((med: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-2">{med.medication_name}</h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Liều lượng:</span> {med.dosage}
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Hướng dẫn:</span> {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ghi Chú */}
              {medicalRecord.notes && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-yellow-600" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold">Ghi Chú</h2>
                  </div>
                  <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{medicalRecord.notes}</p>
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

