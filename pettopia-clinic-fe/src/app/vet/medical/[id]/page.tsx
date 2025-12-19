'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  ClipboardList,
  Pill,
  FileText,
  Calendar,
  Loader2,
  Save,
  Plus,
  X,
  User,
  Phone
} from 'lucide-react';
import {
  updateMedicalRecord,
  getVetPetDetail,
  getVetAppointmentDetail,
  completeAppointment,
  getPetMedicalRecords,
  type MedicalRecordPayload,
  type Medication,
  type VetPetDetail,
  type PetMedicalRecordItem,
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
  const [medicalRecords, setMedicalRecords] = useState<PetMedicalRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState<any>(null);
  const [hasRecord, setHasRecord] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Form state
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);

  // Medication form state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medInstructions, setMedInstructions] = useState('');

  // Word count states
  const [symptomsWordCount, setSymptomsWordCount] = useState(0);
  const [diagnosisWordCount, setDiagnosisWordCount] = useState(0);
  const [notesWordCount, setNotesWordCount] = useState(0);

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

      // Lấy lịch sử hồ sơ bệnh án riêng biệt
      const medicalHistoryResponse = await getPetMedicalRecords(petId);
      const medicalHistory = medicalHistoryResponse.data;
      setMedicalRecords(medicalHistory);

      // Lấy medical record ID từ appointment detail (pet_infos[0].medical_records[0])
      const medicalRecordId = appointmentDetail?.pet_infos?.[0]?.medical_records?.[0];
      
      if (medicalRecordId) {
        // Tìm medical record trong lịch sử bằng ID
        const recordForAppointment = medicalHistory?.find(
          (mr) => mr.medicalRecord?.id === medicalRecordId
        );

        if (recordForAppointment?.medicalRecord) {
          const record = recordForAppointment.medicalRecord;
          setExistingRecord(record);
          setHasRecord(true);
          setSymptoms(record.symptoms || '');
          setSymptomsWordCount((record.symptoms || '').trim().split(/\s+/).filter(word => word.length > 0).length);
          setDiagnosis(record.diagnosis || '');
          setDiagnosisWordCount((record.diagnosis || '').trim().split(/\s+/).filter(word => word.length > 0).length);
          setNotes(record.notes || '');
          setNotesWordCount((record.notes || '').trim().split(/\s+/).filter(word => word.length > 0).length);
          setMedications(recordForAppointment.medications || []);
        } else {
          setExistingRecord(null);
          setHasRecord(false);
          setSymptoms('');
          setDiagnosis('');
          setNotes('');
          setMedications([]);
        }
      } else {
        // Không có medical_records trong pet_infos, set empty
        setExistingRecord(null);
        setHasRecord(false);
        setSymptoms('');
        setDiagnosis('');
        setNotes('');
        setMedications([]);
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

    // Validation
    if (!symptoms.trim()) {
      showError('Triệu chứng không được để trống');
      return;
    }

    if (!diagnosis.trim()) {
      showError('Chẩn đoán không được để trống');
      return;
    }

    const symptomWords = symptoms.trim().split(/\s+/).filter(word => word.length > 0);
    const diagnosisWords = diagnosis.trim().split(/\s+/).filter(word => word.length > 0);
    const notesWords = notes.trim().split(/\s+/).filter(word => word.length > 0);

    if (symptomWords.length > 50) {
      showError('Triệu chứng không được vượt quá 50 từ');
      return;
    }

    if (diagnosisWords.length > 50) {
      showError('Chẩn đoán không được vượt quá 50 từ');
      return;
    }

    if (notesWords.length > 50) {
      showError('Ghi chú không được vượt quá 50 từ');
      return;
    }

    if (medications.length === 0) {
      showError('Đơn thuốc không được để trống');
      return;
    }

    // Validate medications
    for (const med of medications) {
      if (med.medication_name.length > 20) {
        showError('Tên thuốc không được vượt quá 20 ký tự');
        return;
      }
      if (med.dosage.length > 20) {
        showError('Liều lượng không được vượt quá 20 ký tự');
        return;
      }
      if ((med.instructions || '').length > 20) {
        showError('Hướng dẫn sử dụng không được vượt quá 20 ký tự');
        return;
      }
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
        const updatedHistoryResponse = await getPetMedicalRecords(petDetail.id);
        setMedicalRecords(updatedHistoryResponse.data);
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo/cập nhật hồ sơ bệnh án:', error);
      showError(error?.response?.data?.message || 'Không thể tạo/cập nhật hồ sơ bệnh án');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      setCompleting(true);
      await completeAppointment(appointmentId);
      showSuccess('Hoàn thành lịch hẹn thành công!');
      // Có thể redirect hoặc refresh trang
      router.push('/vet/schedule'); // Quay về trang lịch trình
    } catch (error: any) {
      console.error('Lỗi khi hoàn thành lịch hẹn:', error);
      showError(error?.response?.data?.message || 'Không thể hoàn thành lịch hẹn');
    } finally {
      setCompleting(false);
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
    <div className=" p-4 md:p-8">
      <div className="">
        <button
          onClick={() => router.back()}
          className="flex gap-2 text-teal-600 hover:text-teal-700 mb-2 font-medium"
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

            {/* Nút hoàn thành lịch hẹn */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCompleteAppointment}
                  disabled={completing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Đang hoàn thành...
                    </>
                  ) : (
                    <>
                      <ClipboardList size={16} />
                      Hoàn thành lịch hẹn
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin thú cưng & lịch sử hồ sơ bệnh án */}
        {petDetail && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Thông tin thú cưng</h2>
                <p className="text-gray-600 text-sm">
                  {petDetail.name} • {petDetail.species}
                  {petDetail.breed ? ` • ${petDetail.breed}` : ''}
                </p>
              </div>
              {petDetail.owner && (
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium flex items-center justify-end gap-1">
                    <User size={14} />
                    {petDetail.owner.fullname}
                  </p>
                  {petDetail.owner.phone && (
                    <p className="flex items-center justify-end gap-1 mt-1">
                      <Phone size={14} />
                      {petDetail.owner.phone}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Lịch sử hồ sơ bệnh án
              </h3>

              {medicalRecords && medicalRecords.length > 0 ? (
                <div className="space-y-3">
                  {medicalRecords.map((mr) => (
                    <div
                      key={mr.medicalRecord.id}
                      className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {mr.medicalRecord.diagnosis || 'Chẩn đoán không xác định'}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          {formatDate(mr.medicalRecord.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Triệu chứng:</span>{' '}
                        {mr.medicalRecord.symptoms}
                      </p>
                      {mr.medicalRecord.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Ghi chú:</span> {mr.medicalRecord.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Chưa có hồ sơ bệnh án nào cho thú cưng này.
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowMedicalModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <FileText size={16} />
                  {hasRecord ? 'Cập nhật hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo/cập nhật hồ sơ bệnh án */}
        {showMedicalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h1 className="text-xl font-bold text-teal-600 mb-1">
                    {hasRecord ? 'Cập nhật hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án'}
                  </h1>
                  <p className="text-gray-600 text-sm">Medical Record</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {hasRecord && existingRecord && (
                <div className="px-4 py-3 bg-green-50 border-b border-green-200 text-sm text-green-700">
                  ✓ Hồ sơ bệnh án đã được tạo trước đó. Bạn có thể chỉnh sửa thông tin bên dưới.
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-4 space-y-5">
                {/* Triệu Chứng */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="text-red-600" size={18} />
                    </div>
                    <h2 className="text-base font-semibold">Triệu Chứng</h2>
                  </div>
                  <textarea
                    value={symptoms}
                    onChange={(e) => {
                      setSymptoms(e.target.value);
                      const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                      setSymptomsWordCount(words.length);
                    }}
                    className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    rows={4}
                    placeholder="Nhập triệu chứng của bệnh nhân..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{symptomsWordCount}/50 từ</p>
                </div>

                {/* Chẩn Đoán */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                      <ClipboardList className="text-green-600" size={18} />
                    </div>
                    <h2 className="text-base font-semibold">Chẩn Đoán</h2>
                  </div>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => {
                      setDiagnosis(e.target.value);
                      const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                      setDiagnosisWordCount(words.length);
                    }}
                    className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    rows={4}
                    placeholder="Nhập chẩn đoán..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{diagnosisWordCount}/50 từ</p>
                </div>

                {/* Đơn Thuốc */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Pill className="text-purple-600" size={18} />
                    </div>
                    <h2 className="text-base font-semibold">Đơn Thuốc <span className="text-red-500">*</span></h2>
                    <p className="text-xs text-gray-500 mt-1">Bắt buộc phải có ít nhất một loại thuốc</p>
                  </div>

                  {/* Form thêm thuốc */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={medName}
                        onChange={(e) => setMedName(e.target.value)}
                        placeholder="Tên thuốc"
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        maxLength={20}
                      />
                      <input
                        type="text"
                        value={medDosage}
                        onChange={(e) => setMedDosage(e.target.value)}
                        placeholder="Liều lượng"
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        maxLength={20}
                      />
                      <input
                        type="text"
                        value={medInstructions}
                        onChange={(e) => setMedInstructions(e.target.value)}
                        placeholder="Hướng dẫn sử dụng"
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        maxLength={20}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      <Plus size={16} />
                      Thêm thuốc
                    </button>
                  </div>

                  {/* Danh sách thuốc đã thêm */}
                  {medications.length > 0 && (
                    <div className="space-y-3">
                      {medications.map((med, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">
                                {med.medication_name}
                              </h3>
                              <p className="text-gray-600">
                                <span className="font-medium">Liều lượng:</span> {med.dosage}
                              </p>
                              {med.instructions && (
                                <p className="text-gray-600 mt-1">
                                  <span className="font-medium">Hướng dẫn:</span>{' '}
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                            >
                              <X size={16} />
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
                    <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-yellow-600" size={18} />
                    </div>
                    <h2 className="text-base font-semibold">Ghi Chú</h2>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                      setNotesWordCount(words.length);
                    }}
                    className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    rows={3}
                    placeholder="Ghi chú thêm (tùy chọn)..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{notesWordCount}/50 từ</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMedicalModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {hasRecord ? 'Cập nhật hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

