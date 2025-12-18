'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppointments, rateAppointment, getAppointmentDetail, getAppointmentRating, type Appointment, type AppointmentsResponse, type RatingPayload, type AppointmentDetail, type AppointmentRating } from '@/services/petcare/petService';

export default function PrescriptionHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Cancelled'>('all');

  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState<Appointment | null>(null);
  const [ratingStars, setRatingStars] = useState<Record<string, number>>({});
  const [ratingNotes, setRatingNotes] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<Record<string, { name: string; description?: string }>>({});
  const [appointmentRatings, setAppointmentRatings] = useState<Record<string, AppointmentRating>>({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: AppointmentsResponse = await getAppointments({ page: 1, limit: 200 });

        // Lọc chỉ lấy appointments có status Completed hoặc Cancelled
        const historyAppointments = response.data.filter(
          (apt: Appointment) => apt.status === 'Completed' || apt.status === 'Cancelled'
        );

        // Sắp xếp theo ngày mới nhất trước
        historyAppointments.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });

        setAppointments(historyAppointments);

        // Load ratings cho các appointments đã hoàn thành
        const ratingsMap: Record<string, AppointmentRating> = {};
        const ratingPromises = historyAppointments
          .filter(apt => apt.status === 'Completed')
          .map(async (apt) => {
            try {
              const rating = await getAppointmentRating(apt.id);
              if (rating) {
                ratingsMap[apt.id] = rating;
              }
            } catch (err) {
              // Bỏ qua lỗi, có thể appointment chưa có rating
              console.log(`No rating found for appointment ${apt.id}`);
            }
          });
        
        await Promise.all(ratingPromises);
        setAppointmentRatings(ratingsMap);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải lịch sử khám.');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatShift = (shift?: string) => {
    if (!shift) return 'Chưa rõ';
    const shiftMap: Record<string, string> = {
      Morning: 'Sáng',
      Afternoon: 'Chiều',
      Evening: 'Tối',
      Night: 'Đêm',
    };
    return shiftMap[shift] || shift;
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Chưa rõ';
    const statusMap: Record<string, string> = {
      Completed: 'Hoàn thành',
      Cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      Completed: 'bg-blue-500',
      Cancelled: 'bg-red-500',
    };
    return colorMap[status || ''] || 'bg-gray-500';
  };

  const getStatusBadgeColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      Completed: 'bg-blue-100 text-blue-800 border-blue-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[status || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Rating functions
  const openRatingModal = async (appointment: Appointment) => {
    // Kiểm tra xem appointment đã được đánh giá chưa
    if (appointmentRatings[appointment.id]) {
      alert('Lịch hẹn này đã được đánh giá trước đó. Bạn không thể đánh giá lại.');
      return;
    }

    setSelectedAppointmentForRating(appointment);
    setRatingStars({});
    setRatingNotes('');
    setServiceDetails({});
    setShowRatingModal(true);

    // Load service details
    try {
      const appointmentDetail: AppointmentDetail = await getAppointmentDetail(appointment.id);
      const details: Record<string, { name: string; description?: string }> = {};
      appointmentDetail.service_infos?.forEach(service => {
        details[service.id || ''] = {
          name: service.name || 'Dịch vụ không tên',
          description: service.description
        };
      });
      setServiceDetails(details);
    } catch (err) {
      console.error('Error loading service details:', err);
      // Fallback to service IDs
      const details: Record<string, { name: string; description?: string }> = {};
      appointment.service_ids?.forEach(serviceId => {
        details[serviceId] = { name: `Dịch vụ ${serviceId.slice(0, 8)}...` };
      });
      setServiceDetails(details);
    }
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedAppointmentForRating(null);
    setRatingStars({});
    setRatingNotes('');
    setServiceDetails({});
  };

  const handleStarClick = (serviceId: string, stars: number) => {
    setRatingStars(prev => ({
      ...prev,
      [serviceId]: stars
    }));
  };

  const handleSubmitRating = async () => {
    if (!selectedAppointmentForRating) return;

    // Validate that at least one service has rating
    const ratedServices = Object.keys(ratingStars);
    if (ratedServices.length === 0) {
      alert('Vui lòng đánh giá ít nhất một dịch vụ');
      return;
    }

    // Check if all rated services have at least 1 star
    const invalidRatings = ratedServices.filter(serviceId => ratingStars[serviceId] < 1 || ratingStars[serviceId] > 5);
    if (invalidRatings.length > 0) {
      alert('Số sao phải từ 1 đến 5');
      return;
    }

    try {
      setRatingSubmitting(true);

      const payload: RatingPayload = {
        stars: Math.max(...Object.values(ratingStars)), // Use highest rating as overall
        notes: ratingNotes.trim(),
        service_ids: ratedServices
      };

      await rateAppointment(selectedAppointmentForRating.id, payload);

      // Cập nhật rating vào state
      const newRating: AppointmentRating = {
        id: '',
        appointment_id: selectedAppointmentForRating.id,
        clinic_id: selectedAppointmentForRating.clinic_id,
        user_id: selectedAppointmentForRating.user_id,
        stars: payload.stars,
        notes: payload.notes,
        service_ids: payload.service_ids,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAppointmentRatings(prev => ({
        ...prev,
        [selectedAppointmentForRating.id]: newRating
      }));

      alert('Cảm ơn bạn đã đánh giá!');
      closeRatingModal();
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      // Xử lý lỗi cụ thể từ backend
      const errorMessage = err?.message || err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
      
      if (err?.status === 400 || err?.response?.status === 400) {
        // Nếu đã được đánh giá, reload lại rating để cập nhật UI
        try {
          const existingRating = await getAppointmentRating(selectedAppointmentForRating.id);
          if (existingRating) {
            setAppointmentRatings(prev => ({
              ...prev,
              [selectedAppointmentForRating.id]: existingRating
            }));
          }
        } catch (reloadErr) {
          console.error('Error reloading rating:', reloadErr);
        }
      }
      
      alert(errorMessage);
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Lọc appointments theo status filter
  const filteredAppointments = statusFilter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải lịch sử khám...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-xl font-bold mb-4">Lỗi</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử khám</h1>
          <p className="text-gray-600">Xem lại các lịch hẹn đã hoàn thành hoặc đã hủy</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                ? 'bg-teal-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Tất cả ({appointments.length})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'Completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Hoàn thành ({appointments.filter(a => a.status === 'Completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('Cancelled')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'Cancelled'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Đã hủy ({appointments.filter(a => a.status === 'Cancelled').length})
          </button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch sử khám</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all'
                ? 'Bạn chưa có lịch hẹn nào đã hoàn thành hoặc đã hủy.'
                : `Bạn chưa có lịch hẹn nào với trạng thái "${formatStatus(statusFilter)}".`}
            </p>
            <Link
              href="/user/appointments/booking"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Đặt lịch khám mới
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {formatDate(appointment.date)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(appointment.status)}`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-6">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatShift(appointment.shift)}</span>
                        </div>
                        {appointment.pet_ids && appointment.pet_ids.length > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{appointment.pet_ids.length} thú cưng</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {appointment.status === 'Completed' && (
                        <>
                          {appointmentRatings[appointment.id] ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-medium text-green-700">
                                Đã đánh giá ({appointmentRatings[appointment.id].stars} sao)
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => openRatingModal(appointment)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                            >
                              Đánh giá
                            </button>
                          )}
                          <Link
                            href={`/user/appointments/${appointment.id}/medical-record`}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                          >
                            Xem hồ sơ bệnh án
                          </Link>
                        </>
                      )}
                      <Link
                        href={`/user/appointments/${appointment.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dịch vụ</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.service_ids?.length || 0} dịch vụ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.createdAt ? formatDate(appointment.createdAt) : 'Chưa rõ'}
                      </p>
                    </div>
                  </div>

                  {/* Cancel Reason (if cancelled) */}
                  {appointment.status === 'Cancelled' && (appointment as any).cancel_reason && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Lý do hủy</p>
                      <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                        {(appointment as any).cancel_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/user/appointments/list"
            className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Xem tất cả lịch hẹn
          </Link>
          <Link
            href="/user/appointments/booking"
            className="flex-1 text-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
          >
            Đặt lịch khám mới
          </Link>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedAppointmentForRating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Đánh giá dịch vụ</h3>
                <p className="text-gray-600 mt-1">
                  Lịch hẹn: {formatDate(selectedAppointmentForRating.date)} - {formatShift(selectedAppointmentForRating.shift)}
                </p>
              </div>
              <button
                onClick={closeRatingModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Service Ratings */}
              <div>
              
                <div className="space-y-4">
                  {selectedAppointmentForRating.service_ids?.map((serviceId) => (
                    <div key={serviceId} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-md font-semibold">Đánh giá dịch vụ</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleStarClick(serviceId, star)}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`w-8 h-8 ${(ratingStars[serviceId] || 0) >= star
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                  } hover:text-yellow-400 transition-colors`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      {(ratingStars[serviceId] || 0) > 0 && (
                        <p className="text-sm text-gray-600">
                          Số sao đánh giá: {ratingStars[serviceId]} sao
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={ratingNotes}
                  onChange={(e) => setRatingNotes(e.target.value)}
                  placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {ratingNotes.length}/100 ký tự
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={closeRatingModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                  disabled={ratingSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={ratingSubmitting || Object.keys(ratingStars).length === 0}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ratingSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    'Gửi đánh giá'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









