'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, ClipboardList, Pill, FileText, Calendar, Loader2, Save, Plus, X, User, Phone, Mail, MapPin } from 'lucide-react';
import {
  updateMedicalRecord,
  getVetPetDetail,
  getVetAppointmentDetail,
  type MedicalRecordPayload,
  type Medication,
  type VetPetDetail,
  type VetPetMedicalRecord,
  type VetAppointmentDetail,
} from '@/services/partner/veterianrianService';
import { useToast } from '@/contexts/ToastContext';

// Using VetAppointmentDetail type from service
type AppointmentDetail = VetAppointmentDetail;

export default function VetMedicalRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentDetail | null>(null);
  const [petDetail, setPetDetail] = useState<VetPetDetail | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<VetPetMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState<any>(null);
  const [hasRecord, setHasRecord] = useState(false);

  // Form state
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);

  // Medication form state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medInstructions, setMedInstructions] = useState('');

  useEffect(() => {
    if (appointmentId) {
      fetchData();
    }
  }, [appointmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getVetAppointmentDetail(appointmentId);
      if (response.status === 'success' && response.data) {
        const detail = response.data;
        setAppointmentDetail(detail);

        const petId = detail?.pet_infos?.[0]?.id;
        if (petId) {
          // Lấy medical record ID từ appointment detail nếu có
          const medicalRecordId = detail?.pet_infos?.[0]?.medical_records?.[0];
          console.log('Medical Record ID from appointment:', medicalRecordId);
          
          await fetchPetDetail(petId);
        } else {
          setPetDetail(null);
          setMedicalRecords([]);
          setExistingRecord(null);
          setHasRecord(false);
          setSymptoms('');
          setDiagnosis('');
          setNotes('');
          setMedications([]);
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy chi tiết appointment:', error);
      showError(error?.response?.data?.message || 'Không thể tải chi tiết lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const fetchPetDetail = async (petId: string) => {
    try {
      const data = await getVetPetDetail(petId);
      setPetDetail(data);
      setMedicalRecords(data.medical_records || []);

      // Lấy medical record ID từ appointment detail (pet_infos[0].medical_records[0])
      const medicalRecordId = appointmentDetail?.pet_infos?.[0]?.medical_records?.[0];
      
      if (medicalRecordId) {
        // Tìm medical record trong pet detail bằng ID
        const recordForAppointment = data.medical_records?.find(
          (mr) => mr.medicalRecord?.id === medicalRecordId || mr.medicalRecord?._id === medicalRecordId
        );

        if (recordForAppointment?.medicalRecord) {
          const record = recordForAppointment.medicalRecord;
          setExistingRecord(record);
          setHasRecord(true);
          setSymptoms(record.symptoms || '');
          setDiagnosis(record.diagnosis || '');
          setNotes(record.notes || '');
          setMedications(recordForAppointment.medications || []);
        } else {
          // Fallback: tìm theo appointment_id nếu không tìm thấy bằng ID
          const recordByAppointmentId = data.medical_records?.find(
            (mr) => mr.medicalRecord?.appointment_id === appointmentId
          );
          
          if (recordByAppointmentId?.medicalRecord) {
            const record = recordByAppointmentId.medicalRecord;
            setExistingRecord(record);
            setHasRecord(true);
            setSymptoms(record.symptoms || '');
            setDiagnosis(record.diagnosis || '');
            setNotes(record.notes || '');
            setMedications(recordByAppointmentId.medications || []);
          } else {
            setExistingRecord(null);
            setHasRecord(false);
            setSymptoms('');
            setDiagnosis('');
            setNotes('');
            setMedications([]);
          }
        }
      } else {
        // Fallback: tìm theo appointment_id nếu không có medical_records trong pet_infos
        const recordForAppointment = data.medical_records?.find(
          (mr) => mr.medicalRecord?.appointment_id === appointmentId
        );

        if (recordForAppointment?.medicalRecord) {
          const record = recordForAppointment.medicalRecord;
          setExistingRecord(record);
          setHasRecord(true);
          setSymptoms(record.symptoms || '');
          setDiagnosis(record.diagnosis || '');
          setNotes(record.notes || '');
          setMedications(recordForAppointment.medications || []);
        } else {
          setExistingRecord(null);
          setHasRecord(false);
          setSymptoms('');
          setDiagnosis('');
          setNotes('');
          setMedications([]);
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy chi tiết thú cưng:', error);
      showError(error?.response?.data?.message || 'Không thể tải thông tin thú cưng');
    }
  };

  const handleAddMedication = () => {
    if (!medName.trim() || !medDosage.trim()) {
      showError('Vui lòng điền đầy đủ tên thuốc và liều lượng');
      return;
    }

    setMedications([
      ...medications,
      {
        medication_name: medName,
        dosage: medDosage,
        instructions: medInstructions || undefined
      }
    ]);

    // Reset form
    setMedName('');
    setMedDosage('');
    setMedInstructions('');
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptoms.trim() || !diagnosis.trim()) {
      showError('Vui lòng điền đầy đủ triệu chứng và chẩn đoán');
      return;
    }

    try {
      setSaving(true);
      const payload: MedicalRecordPayload = {
        pet_id: appointmentDetail?.pet_infos?.[0]?.id || '',
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        medications: medications.length > 0 ? medications : undefined
      };

      await updateMedicalRecord(appointmentId, payload);
      showSuccess(hasRecord ? 'Cập nhật hồ sơ bệnh án thành công!' : 'Tạo hồ sơ bệnh án thành công!');
      
      // Refresh để hiển thị record vừa tạo
      if (petDetail?.id) {
        await fetchPetDetail(petDetail.id);
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo/cập nhật hồ sơ bệnh án:', error);
      showError(error?.response?.data?.message || 'Không thể tạo/cập nhật hồ sơ bệnh án');
    } finally {
      setSaving(false);
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
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p className="text-gray-600">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (!appointmentDetail) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy thông tin lịch hẹn</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium"
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
              {appointmentDetail.user_info && (
                <>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span>{appointmentDetail.user_info.fullname}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Phone size={16} />
                    <span>{appointmentDetail.user_info.phone_number}</span>
                  </div>
                </>
              )}
            </div>

            {appointmentDetail.pet_infos && appointmentDetail.pet_infos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Thú cưng</h3>
                {appointmentDetail.pet_infos.map((pet, index) => (
                  <div key={pet.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="font-medium text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">
                      {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {appointmentDetail.service_infos && appointmentDetail.service_infos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Dịch vụ</h3>
                {appointmentDetail.service_infos.map((service, index) => (
                  <div key={service.id || index} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-gray-600">{service.description}</p>
                    )}
                    {service.price && (
                      <p className="text-sm text-gray-600 mt-1">
                        Giá: {service.price.toLocaleString('vi-VN')} VNĐ
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form tạo hồ sơ bệnh án */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-teal-600 mb-1">HỒ SƠ BỆNH ÁN</h1>
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

          {hasRecord && existingRecord && (
            <div className="p-6 bg-green-50 border-b border-green-200">
              <p className="text-green-700 font-medium">✓ Hồ sơ bệnh án đã được tạo. Bạn có thể cập nhật.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Triệu Chứng */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="text-red-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold">Triệu Chứng</h2>
              </div>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="Nhập triệu chứng của bệnh nhân..."
                required
              />
            </div>

            {/* Chẩn Đoán */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="text-green-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold">Chẩn Đoán</h2>
              </div>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="Nhập chẩn đoán..."
                required
              />
            </div>

            {/* Đơn Thuốc */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Pill className="text-purple-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold">Đơn Thuốc</h2>
              </div>

              {/* Form thêm thuốc */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Tên thuốc"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="Liều lượng"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    placeholder="Hướng dẫn sử dụng"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Plus size={18} />
                  Thêm thuốc
                </button>
              </div>

              {/* Danh sách thuốc đã thêm */}
              {medications.length > 0 && (
                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
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
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ghi Chú */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-yellow-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold">Ghi Chú</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Ghi chú thêm (tùy chọn)..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {hasRecord ? 'Cập nhật hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

