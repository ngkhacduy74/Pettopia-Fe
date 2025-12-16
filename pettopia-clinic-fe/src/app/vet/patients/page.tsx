'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  User, 
  Phone, 
  Heart, 
  ClipboardList, 
  Pill, 
  FileText, 
  Plus, 
  X, 
  Save, 
  Loader2,
  Edit,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { 
  getAppointmentDetail, 
  getMedicalRecord
} from '@/services/partner/clinicService';
import { 
  getVetAppointments,
  updateMedicalRecord, 
  type MedicalRecordPayload, 
  type Medication,
  type VetAppointment
} from '@/services/partner/veterianrianService';
import { useToast } from '@/contexts/ToastContext';

export default function VetPatientsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<VetAppointment | null>(null);
  const [appointmentDetail, setAppointmentDetail] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Lấy cả Checked_In và Completed
      const [checkedInResponse, completedResponse] = await Promise.all([
        getVetAppointments('Checked_In'),
        getVetAppointments('Completed')
      ]);
      
      const allAppointments: VetAppointment[] = [];
      
      if (checkedInResponse.status === 'success' && checkedInResponse.data) {
        allAppointments.push(...checkedInResponse.data);
      }
      
      if (completedResponse.status === 'success' && completedResponse.data) {
        allAppointments.push(...completedResponse.data);
      }
      
      setAppointments(allAppointments);
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách appointments:', error);
      showError(error?.response?.data?.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (appointment: VetAppointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
    setLoadingDetail(true);

    try {
      // Fetch appointment detail
      const appointmentId = appointment.id || appointment._id;
      const detailResponse = await getAppointmentDetail(appointmentId);
      if (detailResponse.status === 'success' && detailResponse.data) {
        setAppointmentDetail(detailResponse.data);
      }

      // Check for existing medical record
      const recordResponse = await getMedicalRecord(appointmentId);
      if (recordResponse && recordResponse.data) {
        setSymptoms(recordResponse.data.symptoms || '');
        setDiagnosis(recordResponse.data.diagnosis || '');
        setNotes(recordResponse.data.notes || '');
        setMedications(recordResponse.data.medications || []);
      } else {
        // Reset form if no record
        setSymptoms('');
        setDiagnosis('');
        setNotes('');
        setMedications([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy chi tiết appointment:', error);
      showError('Không thể tải chi tiết lịch hẹn');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setAppointmentDetail(null);
    setSymptoms('');
    setDiagnosis('');
    setNotes('');
    setMedications([]);
    setMedName('');
    setMedDosage('');
    setMedInstructions('');
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

    if (!selectedAppointment || !appointmentDetail) {
      showError('Thông tin lịch hẹn không hợp lệ');
      return;
    }

    const appointmentId = selectedAppointment.id || selectedAppointment._id;
    const petId = appointmentDetail.pet_infos?.[0]?.id || appointmentDetail.pet_ids?.[0];

    if (!petId) {
      showError('Không tìm thấy thông tin thú cưng');
      return;
    }

    try {
      setSaving(true);
      const payload: MedicalRecordPayload = {
        pet_id: petId,
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        medications: medications.length > 0 ? medications : undefined
      };

      await updateMedicalRecord(appointmentId, payload);
      showSuccess('Cập nhật hồ sơ bệnh án thành công!');
      
      // Refresh appointments list
      await fetchAppointments();
      
      // Close modal after a short delay
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật hồ sơ bệnh án:', error);
      showError(error?.response?.data?.message || 'Không thể cập nhật hồ sơ bệnh án');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    const appointmentId = (apt.id || apt._id || '').toLowerCase();
    const status = (apt.status || '').toLowerCase();
    return (
      appointmentId.includes(searchLower) ||
      status.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p className="text-gray-600">Đang tải danh sách bệnh nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách bệnh nhân</h1>
          <p className="text-gray-600">Quản lý và cập nhật hồ sơ bệnh án cho bệnh nhân</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID lịch hẹn, trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">Không có lịch hẹn nào</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id || appointment._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="text-teal-600" size={20} />
                      <span className="font-semibold text-gray-900">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {appointment.shift}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'Checked_In'
                            ? 'bg-blue-100 text-blue-700'
                            : appointment.status === 'Confirmed'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">ID:</span> {appointment.id?.slice(0, 8) || appointment._id?.slice(0, 8)}
                    </div>
                  </div>
                  {appointment.status === 'Checked_In' ? (
                    <button
                      onClick={() => handleOpenModal(appointment)}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      <Edit size={18} />
                      Cập nhật hồ sơ
                    </button>
                  ) : appointment.status === 'Completed' ? (
                    <button
                      onClick={() => router.push(`/vet/medical/${appointment.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      <Eye size={18} />
                      Xem chi tiết
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Medical Record */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-teal-600 mb-1">CẬP NHẬT HỒ SƠ BỆNH ÁN</h2>
                  <p className="text-gray-600">Medical Record</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="animate-spin text-teal-600" size={32} />
                </div>
              ) : (
                <div className="p-6">
                  {/* Appointment Info */}
                  {appointmentDetail && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin lịch hẹn</h3>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{formatDate(appointmentDetail.date || selectedAppointment?.date || '')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Ca:</span>
                          <span>{appointmentDetail.shift || selectedAppointment?.shift || ''}</span>
                        </div>
                        {appointmentDetail.user_info && (
                          <>
                            <div className="flex items-center gap-2 text-gray-600">
                              <User size={16} />
                              <span>{appointmentDetail.user_info.fullname}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone size={16} />
                              <span>{appointmentDetail.user_info.phone_number}</span>
                            </div>
                          </>
                        )}
                        {appointmentDetail.pet_infos && appointmentDetail.pet_infos.length > 0 && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Thú cưng: </span>
                            {appointmentDetail.pet_infos.map((pet: any) => (
                              <span key={pet.id} className="text-gray-600">
                                {pet.name} ({pet.species} - {pet.breed})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medical Record Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Triệu Chứng */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Heart className="text-red-600" size={20} />
                        </div>
                        <h3 className="text-lg font-semibold">Triệu Chứng</h3>
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
                        <h3 className="text-lg font-semibold">Chẩn Đoán</h3>
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
                        <h3 className="text-lg font-semibold">Đơn Thuốc</h3>
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
                                  <h4 className="font-medium text-gray-900 mb-2">{med.medication_name}</h4>
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
                        <h3 className="text-lg font-semibold">Ghi Chú</h3>
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
                    <div className="pt-6 border-t border-gray-200 flex gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Cập nhật hồ sơ
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

