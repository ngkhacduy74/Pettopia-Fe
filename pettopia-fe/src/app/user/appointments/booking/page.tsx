'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getClinics,
  getServicesByClinic,
  getShiftsByClinic,
  getPetsByOwner,
  bookAppointment,
  getClinicRating,
  type Clinic,
  type Service,
  type Shift,
  type PetDetailResponse,
  type ClinicRatingStats,
} from '@/services/petcare/petService';

type Pet = PetDetailResponse;
type PetServiceMap = Record<string, string[]>;

const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    console.error('Failed to parse JWT', e);
    return null;
  }
};

export default function AppointmentBooking() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [petServiceMap, setPetServiceMap] = useState<PetServiceMap>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipPetSelection, setSkipPetSelection] = useState(false);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clinic detail modal
  const [showClinicDetail, setShowClinicDetail] = useState(false);
  const [selectedClinicForDetail, setSelectedClinicForDetail] = useState<Clinic | null>(null);
  const [clinicRatingStats, setClinicRatingStats] = useState<ClinicRatingStats | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // Load clinics
  useEffect(() => {
    const loadClinics = async () => {
      try {
        setLoading(true);
        const data = await getClinics();
        setClinics(data);
      } catch (err) {
        setError('Không tải được danh sách phòng khám');
        console.error('Error loading clinics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadClinics();
  }, []);

  // Load services khi chọn clinic
  useEffect(() => {
    if (!selectedClinic) {
      setServices([]);
      return;
    }

    const loadServices = async () => {
      try {
        setServicesLoading(true);
        const data = await getServicesByClinic(selectedClinic);
        setServices(data);
      } catch (err) {
        console.error('Error loading services:', err);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, [selectedClinic]);

  // Load shifts khi chọn clinic
  useEffect(() => {
    if (!selectedClinic) {
      setShifts([]);
      return;
    }

    const loadShifts = async () => {
      try {
        setShiftsLoading(true);
        const data = await getShiftsByClinic(selectedClinic);
        setShifts(data);
      } catch (err) {
        console.error('Error loading shifts:', err);
        setShifts([]);
      } finally {
        setShiftsLoading(false);
      }
    };
    loadShifts();
  }, [selectedClinic]);

  // Load pets
  useEffect(() => {
    const loadPets = async () => {
      try {
        setPetsLoading(true);
        const token = localStorage.getItem('authToken');
        let userId = localStorage.getItem('userId');

        if (!userId && token) {
          const decoded = parseJwt(token);
          const resolved = decoded?.userId ?? decoded?.id ?? decoded?.sub ?? null;
          if (resolved) {
            userId = String(resolved);
            localStorage.setItem('userId', userId);
          }
        }

        if (!userId) throw new Error('Không thể lấy userId');

        const data = await getPetsByOwner(userId);
        setPets(data);
      } catch (err) {
        console.log('Error loading pets:', err);
        setPets([]);
      } finally {
        setPetsLoading(false);
      }
    };

    loadPets();
  }, []);

  const selectedClinicInfo = clinics.find(c => c.id === selectedClinic);

  const formatAddress = (address: any) =>
    `${address.detail}, ${address.ward}, ${address.district}, ${address.city}`;

  const formatDate = (date: string) => {
    if (!date) return '';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h${m}ph` : `${h}h`;
  };

  const formatShiftName = (shift: string) => {
    const shiftMap: Record<string, string> = {
      'morning': 'Sáng',
      'afternoon': 'Chiều',
      'evening': 'Tối',
      'night': 'Đêm',
      'Morning': 'Sáng',
      'Afternoon': 'Chiều',
      'Evening': 'Tối',
      'Night': 'Đêm',
    };
    return shiftMap[shift] || shift;
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const isShiftPast = (shift?: Shift | null, dateStr?: string) => {
    if (!shift || !dateStr) return false;
    const [year, month, day] = dateStr.split('-').map(n => parseInt(n, 10));
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return false;
    const [hStr = '0', mStr = '0'] = (shift.end_time || '00:00').split(':');
    const hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    const shiftEnd = new Date(year, month - 1, day, hours, minutes, 0);
    return shiftEnd.getTime() <= Date.now();
  };

  useEffect(() => {
    if (!selectedShift || !selectedDate) return;
    const chosen = shifts.find(s => s.id === selectedShift);
    if (isShiftPast(chosen, selectedDate)) {
      setSelectedShift('');
    }
  }, [selectedDate, shifts, selectedShift]);

  const togglePet = (petId: string) => {
    if (selectedPet === petId) {
      setSelectedPet('');
      setPetServiceMap({});
      setSelectedServices([]);
    } else {
      setSelectedPet(petId);
      const currentServices = selectedServices.length > 0 ? selectedServices : [];
      setPetServiceMap({ [petId]: currentServices });
      setSkipPetSelection(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      if (selectedPet) {
        setPetServiceMap({ [selectedPet]: newServices });
      }
      
      return newServices;
    });
  };

  const handleSkipPet = () => {
    setSkipPetSelection(true);
    setSelectedPet('');
    setPetServiceMap({});
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedClinic !== '';
      case 2: {
        if (!selectedDate || !selectedShift) return false;
        const chosen = shifts.find(s => s.id === selectedShift);
        return !isShiftPast(chosen, selectedDate);
      }
      case 3: return selectedPet !== '' || skipPetSelection;
      case 4: return selectedServices.length > 0;
      default: return true;
    }
  };

  const calculateTotal = () => {
    let total = 0;
    selectedServices.forEach(id => {
      const service = services.find(s => s.id === id);
      if (service) total += service.price;
    });
    return total;
  };

  const handleSubmit = async () => {
    const payload = {
      clinic_id: selectedClinic,
      pet_ids: selectedPet ? [selectedPet] : [],
      service_ids: selectedServices,
      date: selectedDate,
      shift_id: selectedShift,
    };

    try {
      setIsSubmitting(true);
      await bookAppointment(payload);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(1);
        setSelectedClinic('');
        setSelectedDate('');
        setSelectedShift('');
        setSelectedPet('');
        setSelectedServices([]);
        setPetServiceMap({});
        setSkipPetSelection(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (err) {
      alert('Đặt lịch thất bại. Vui lòng thử lại!');
      console.error('Submit error:', err);
      setIsSubmitting(false);
    }
  };

  const availableCities = [...new Set(clinics.map(c => c.address.city))];
  const filteredClinics = selectedCity === 'all' ? clinics : clinics.filter(c => c.address.city === selectedCity);

  const handleViewClinicDetail = async (clinic: Clinic) => {
    setSelectedClinicForDetail(clinic);
    setShowClinicDetail(true);
    setRatingsLoading(true);
    try {
      const stats = await getClinicRating(clinic.id);
      setClinicRatingStats(stats);
    } catch (err) {
      console.error('Error loading clinic rating stats:', err);
      setClinicRatingStats(null);
    } finally {
      setRatingsLoading(false);
    }
  };

  const closeClinicDetail = () => {
    setShowClinicDetail(false);
    setSelectedClinicForDetail(null);
    setClinicRatingStats(null);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 lg:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Đặt lịch khám thú cưng</h1>
          <p className="text-lg text-gray-600">Chăm sóc sức khỏe cho bé yêu của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep >= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step}
                </div>
                {step < 5 && <div className={`w-24 h-1 mx-4 ${currentStep > step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-4 text-center mt-4 text-sm font-medium">
            <span className={currentStep >= 1 ? 'text-teal-600' : 'text-gray-500'}>Phòng khám</span>
            <span className={currentStep >= 2 ? 'text-teal-600' : 'text-gray-500'}>Ngày & Ca</span>
            <span className={currentStep >= 3 ? 'text-teal-600' : 'text-gray-500'}>Thú cưng</span>
            <span className={currentStep >= 4 ? 'text-teal-600' : 'text-gray-500'}>Dịch vụ</span>
            <span className={currentStep >= 5 ? 'text-teal-600' : 'text-gray-500'}>Xác nhận</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 min-h-96">
          {/* BƯỚC 1: Chọn phòng khám */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Chọn phòng khám</h2>
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải phòng khám...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16 text-red-600">{error}</div>
              ) : (
                <>
                  <div className="mb-8 flex flex-wrap gap-3">
                    <button onClick={() => setSelectedCity('all')} className={`px-6 py-3 rounded-lg font-medium transition ${selectedCity === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      Tất cả
                    </button>
                    {availableCities.map(city => (
                      <button key={city} onClick={() => setSelectedCity(city)} className={`px-6 py-3 rounded-lg font-medium transition ${selectedCity === city ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        {city}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-6">
                    {filteredClinics.map(clinic => (
                      <div
                        key={clinic.id}
                        onClick={() => setSelectedClinic(clinic.id)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedClinic === clinic.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-9 h-9 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{clinic.clinic_name}</h3>
                              <p className="text-gray-600 text-sm mt-1">{formatAddress(clinic.address)}</p>
                              <p className="text-gray-600 text-sm mt-2">Điện thoại: {clinic.phone.phone_number}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClinicDetail(clinic);
                              }}
                              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                              Xem chi tiết
                            </button>
                            {selectedClinic === clinic.id && (
                              <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredClinics.length === 0 && (
                    <div className="text-center py-16 text-gray-600">
                      <p>Không có phòng khám nào khả dụng.</p>
                      <p>Liên hệ với số điện thoại 1900-XXXX để được hỗ trợ.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* BƯỚC 2: Ngày & Ca */}
          {currentStep === 2 && (
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold mb-6">Chọn ngày khám</h2>
                <input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="max-w-xs w-full px-4 py-3 text-base border-2 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
                {selectedDate && <p className="mt-3 text-teal-600 font-medium">Ngày chọn: {formatDate(selectedDate)}</p>}
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6">Chọn ca khám</h3>
                {shiftsLoading ? (
                  <p className="text-center py-8 text-gray-500">Đang tải ca làm việc...</p>
                ) : shifts.length === 0 ? (
                  <p className="text-center py-8 text-orange-600">Phòng khám chưa có ca làm việc - Tính năng hỗ trợ ca đang phát triển liên hệ sau</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {shifts.map(shift => {
                      const disabled = isShiftPast(shift, selectedDate);
                      return (
                        <div
                          key={shift.id}
                          onClick={() => {
                            if (disabled) return;
                            setSelectedShift(shift.id);
                          }}
                          aria-disabled={disabled}
                          className={`p-5 rounded-xl border-2 text-center transition-all ${disabled ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : selectedShift === shift.id ? 'border-teal-600 bg-teal-50 shadow-md' : 'border-gray-300 hover:border-gray-400 cursor-pointer'}`}
                        >
                          <h4 className="text-lg font-bold text-gray-700">{formatShiftName(shift.shift)}</h4>
                          <p className={`text-xl font-bold mt-2 ${disabled ? 'opacity-60' : ''}`}>{shift.start_time} - {shift.end_time}</p>
                          {disabled && <p className="text-xs text-red-500 mt-2">Ca đã kết thúc</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BƯỚC 3: Chọn thú cưng (OPTIONAL) */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Chọn thú cưng</h2>
              <p className="text-gray-600 mb-8">Bạn có thể chọn thú cưng hoặc bỏ qua bước này</p>
              
              {petsLoading ? (
                <p className="text-center py-12">Đang tải thú cưng...</p>
              ) : pets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Bạn chưa có thú cưng nào trong hệ thống</p>
                  <button
                    onClick={handleSkipPet}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                  >
                    Tiếp tục không chọn thú cưng
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    {pets.map(pet => (
                      <div
                        key={pet.id}
                        onClick={() => togglePet(pet.id)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedPet === pet.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={pet.avatar_url || '/sampleimg/default-pet.jpg'}
                            alt={pet.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold truncate">{pet.name}</h3>
                            <p className="text-gray-600 text-sm mt-1 truncate">{pet.species} • {pet.breed}</p>
                          </div>
                          {selectedPet === pet.id && (
                            <svg className="w-8 h-8 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleSkipPet}
                      className={`px-6 py-3 rounded-lg font-medium transition ${skipPetSelection ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {skipPetSelection ? 'Đã bỏ qua chọn thú cưng' : 'Không chọn thú cưng'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BƯỚC 4: Chọn dịch vụ */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Chọn dịch vụ</h2>
              {servicesLoading ? (
                <p className="text-center py-12">Đang tải dịch vụ...</p>
              ) : services.length === 0 ? (
                <p className="text-center py-12 text-gray-500">Phòng khám chưa có dịch vụ</p>
              ) : (
                <>
                  {selectedPet && (
                    <div className="mb-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
                      <p className="text-sm text-gray-600">Thú cưng đã chọn:</p>
                      {(() => {
                        const pet = pets.find(p => p.id === selectedPet);
                        return pet ? (
                          <div className="flex items-center gap-3 mt-2">
                            <img
                              src={pet.avatar_url || '/sampleimg/default-pet.jpg'}
                              alt={pet.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-bold text-teal-700">{pet.name} ({pet.breed})</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  
                  {skipPetSelection && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <span className="font-bold">Lưu ý:</span> Bạn chưa chọn thú cưng. Dịch vụ sẽ được áp dụng chung cho lịch hẹn.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {services.map(service => (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedServices.includes(service.id) ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">{service.name}</h3>
                            {service.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{service.description}</p>}
                            <p className="text-gray-600 mt-3">Thời gian: {formatDuration(service.duration)}</p>
                            <p className="text-2xl font-bold text-teal-600 mt-4">{service.price.toLocaleString('vi-VN')} ₫</p>
                          </div>
                          {selectedServices.includes(service.id) && (
                            <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* BƯỚC 5: Xác nhận đặt lịch */}
          {currentStep === 5 && selectedClinicInfo && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-center">Xác nhận đặt lịch</h2>

              <div className="space-y-4">
                {/* Phòng khám */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-base mb-3">Phòng khám</h3>
                  <p className="text-lg font-bold">{selectedClinicInfo.clinic_name}</p>
                  <p className="text-gray-600 text-sm mt-1">{formatAddress(selectedClinicInfo.address)}</p>
                  <p className="text-gray-600 text-sm">Điện thoại: {selectedClinicInfo.phone.phone_number}</p>
                </div>

                {/* Thời gian */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-base mb-3">Thời gian khám</h3>
                  <p className="text-base">
                    Ngày: <span className="font-bold text-teal-600">{formatDate(selectedDate)}</span>
                  </p>
                  <p className="text-base mt-2">
                    Ca: <span className="font-bold text-teal-600">
                      {formatShiftName(shifts.find(s => s.id === selectedShift)?.shift || '')}
                    </span>
                    {' '}({shifts.find(s => s.id === selectedShift)?.start_time} - {shifts.find(s => s.id === selectedShift)?.end_time})
                  </p>
                </div>

                {/* Thú cưng */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-base mb-3">Thú cưng</h3>
                  {selectedPet ? (
                    (() => {
                      const pet = pets.find(p => p.id === selectedPet);
                      return pet ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={pet.avatar_url || '/sampleimg/default-pet.jpg'}
                            alt={pet.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold">{pet.name}</p>
                            <p className="text-sm text-gray-600">{pet.species} • {pet.breed}</p>
                          </div>
                        </div>
                      ) : null;
                    })()
                  ) : (
                    <p className="text-gray-500 italic">Không chọn thú cưng cụ thể</p>
                  )}
                </div>

                {/* Chi tiết dịch vụ */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-base mb-4">Chi tiết dịch vụ</h3>
                  {selectedServices.length > 0 ? (
                    <div className="space-y-2">
                      {selectedServices.map(sId => {
                        const service = services.find(s => s.id === sId);
                        if (!service) return null;
                        return (
                          <div key={sId} className="flex justify-between py-1 text-sm">
                            <span>• {service.name}</span>
                            <span className="font-semibold text-teal-600">
                              {service.price.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có dịch vụ nào</p>
                  )}
                </div>

                {/* Tổng tiền */}
                <div className="flex justify-between items-end pt-6 border-t-2 border-dashed border-black mt-8">
                  <div>
                    <p className="font-bold text-xl">Chi phí dự tính</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold tracking-wider">
                      {calculateTotal().toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nút điều hướng */}
        <div className="flex justify-between mt-12">
          <button
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className={`px-8 py-4 rounded-xl font-medium transition ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            Quay lại
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canProceed() || isSubmitting}
              className={`px-8 py-4 rounded-xl font-medium transition ${canProceed() && !isSubmitting ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Tiếp theo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-12 py-5 rounded-xl font-bold text-xl transition shadow-xl transform ${isSubmitting ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                'Xác nhận đặt lịch ngay'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal thành công */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-3 text-gray-800">Đặt lịch thành công!</h3>
            <p className="text-gray-600 text-lg">Chúng tôi đã nhận lịch hẹn của bạn</p>
            <p className="mt-6 text-sm text-gray-500">
              Bạn sẽ nhận thông báo qua ứng dụng và SMS sớm nhé
            </p>
          </div>
        </div>
      )}

      {/* Modal chi tiết phòng khám */}
      {showClinicDetail && selectedClinicForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-bold text-gray-800">{selectedClinicForDetail.clinic_name}</h3>
              <button
                onClick={closeClinicDetail}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Thông tin cơ bản */}
              <div>
                <h4 className="text-xl font-bold mb-4">Thông tin phòng khám</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium">{formatAddress(selectedClinicForDetail.address)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điện thoại</p>
                    <p className="font-medium">{selectedClinicForDetail.phone.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedClinicForDetail.email.email_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giấy phép</p>
                    <p className="font-medium">{selectedClinicForDetail.license_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedClinicForDetail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedClinicForDetail.is_active ? 'Hoạt động' : 'Tạm ngừng'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Đánh giá */}
              <div>
                <h4 className="text-xl font-bold mb-4">Thống kê đánh giá</h4>
                {ratingsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-teal-600"></div>
                    <p className="mt-2 text-gray-600">Đang tải thống kê...</p>
                  </div>
                ) : !clinicRatingStats ? (
                  <p className="text-gray-500 italic">Chưa có đánh giá nào</p>
                ) : (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-8 h-8 ${star <= Math.round(clinicRatingStats.average_stars) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-3xl font-bold text-teal-700">
                          {clinicRatingStats.average_stars.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">
                        {clinicRatingStats.total_ratings} {clinicRatingStats.total_ratings === 1 ? 'đánh giá' : 'đánh giá'}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-teal-200">
                      <p className="text-sm text-gray-600 text-center">
                        Dựa trên {clinicRatingStats.total_ratings} {clinicRatingStats.total_ratings === 1 ? 'đánh giá' : 'đánh giá'} từ khách hàng
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setSelectedClinic(selectedClinicForDetail.id)}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition"
              >
                Chọn phòng khám này
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}