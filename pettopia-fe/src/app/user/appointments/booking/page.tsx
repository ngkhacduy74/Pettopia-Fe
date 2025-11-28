'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getClinics,
  getServicesByClinic,
  getShiftsByClinic,
  getPetsByOwner,
  bookAppointment,
  type Clinic,
  type Service,
  type Shift,
  type PetDetailResponse,
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
  const [petServiceMap, setPetServiceMap] = useState<PetServiceMap>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // --- NEW: check if a shift (by its end_time) is already in the past for a given date ---
  const isShiftPast = (shift?: Shift | null, dateStr?: string) => {
    if (!shift || !dateStr) return false;
    // shift.end_time expected format "HH:mm"
    const [year, month, day] = dateStr.split('-').map(n => parseInt(n, 10));
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return false;
    const [hStr = '0', mStr = '0'] = (shift.end_time || '00:00').split(':');
    const hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    const shiftEnd = new Date(year, month - 1, day, hours, minutes, 0);
    return shiftEnd.getTime() <= Date.now();
  };
  // -------------------------------------------------------------------------------

  // if selectedDate or shifts change and the selectedShift becomes past, clear it
  useEffect(() => {
    if (!selectedShift || !selectedDate) return;
    const chosen = shifts.find(s => s.id === selectedShift);
    if (isShiftPast(chosen, selectedDate)) {
      setSelectedShift('');
    }
  }, [selectedDate, shifts, selectedShift]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        const newMap = { ...petServiceMap };
        Object.keys(newMap).forEach(petId => {
          newMap[petId] = newMap[petId].filter(id => id !== serviceId);
          if (newMap[petId].length === 0) delete newMap[petId];
        });
        setPetServiceMap(newMap);
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const togglePetService = (petId: string, serviceId: string) => {
    setPetServiceMap(prev => {
      const map = { ...prev };
      if (!map[petId]) map[petId] = [];
      if (map[petId].includes(serviceId)) {
        map[petId] = map[petId].filter(id => id !== serviceId);
        if (map[petId].length === 0) delete map[petId];
      } else {
        map[petId].push(serviceId);
      }
      return map;
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedClinic !== '';
      case 2: {
        if (!selectedDate || !selectedShift) return false;
        const chosen = shifts.find(s => s.id === selectedShift);
        return !isShiftPast(chosen, selectedDate);
      }
      case 3: return selectedServices.length > 0;
      case 4: return Object.keys(petServiceMap).length > 0;
      default: return true;
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(petServiceMap).flat().forEach(id => {
      const service = services.find(s => s.id === id);
      if (service) total += service.price;
    });
    return total;
  };

  const handleSubmit = async () => {
    const payload = {
      clinic_id: selectedClinic,
      pet_ids: Object.keys(petServiceMap),
      service_ids: [...new Set(Object.values(petServiceMap).flat())],
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
        setSelectedServices([]);
        setPetServiceMap({});
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
            <span className={currentStep >= 3 ? 'text-teal-600' : 'text-gray-500'}>Dịch vụ</span>
            <span className={currentStep >= 4 ? 'text-teal-600' : 'text-gray-500'}>Thú cưng</span>
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
                          {selectedClinic === clinic.id && (
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

          {/* BƯỚC 3: Chọn dịch vụ */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Chọn dịch vụ</h2>
              {servicesLoading ? (
                <p className="text-center py-12">Đang tải dịch vụ...</p>
              ) : services.length === 0 ? (
                <p className="text-center py-12 text-gray-500">Phòng khám chưa có dịch vụ</p>
              ) : (
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

                  {/* DEBUG: Hiển thị dịch vụ đã chọn */}
                  {/* <div className="col-span-2">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Dịch vụ đã chọn (debug)</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedServices.map(sId => {
                        const svc = services.find(s => s.id === sId);
                        return svc ? <li key={sId} className="text-gray-700">{svc.name}</li> : null;
                      })}
                    </ul>
                  </div> */}
                </div>
              )}
            </div>
          )}

          {/* BƯỚC 4: Chọn thú cưng */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Chọn thú cưng cho từng dịch vụ</h2>
              {petsLoading ? (
                <p className="text-center py-12">Đang tải thú cưng...</p>
              ) : pets.length === 0 ? (
                <p className="text-center py-12 text-red-600">Bạn chưa có thú cưng nào</p>
              ) : (
                <div className="space-y-10">
                  {selectedServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    if (!service) return null;
                    return (
                      <div key={serviceId} className="border-2 border-gray-200 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                        <p className="text-teal-600 font-medium">{formatDuration(service.duration)} • {service.price.toLocaleString('vi-VN')} ₫</p>
                        <div className="grid md:grid-cols-3 gap-4 mt-6">
                          {pets.map(pet => (
                            <div
                              key={pet.id}
                              onClick={() => togglePetService(pet.id, serviceId)}
                              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${petServiceMap[pet.id]?.includes(serviceId) ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}
                            >
                              <img
                                src={pet.avatar_url || '/sampleimg/default-pet.jpg'}
                                alt={pet.name}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base truncate">{pet.name}</h4>
                                <p className="text-sm text-gray-600 truncate">{pet.species} • {pet.breed}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
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

                {/* Chi tiết dịch vụ */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-base mb-4">Chi tiết dịch vụ</h3>
                  {Object.entries(petServiceMap).map(([petId, serviceIds]) => {
                    const pet = pets.find(p => p.id === petId);
                    if (!pet) return null;
                    return (
                      <div key={petId} className="mb-5 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                        <h4 className="text-base font-bold text-teal-700 mb-2">
                          {pet.name} <span className="font-normal text-gray-600 text-sm">({pet.breed})</span>
                        </h4>
                        {serviceIds.map(sId => {
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
                    );
                  })}
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
            disabled={currentStep === 1 || isSubmitting} // ✅ DISABLE KHI ĐANG LOADING
            className={`px-8 py-4 rounded-xl font-medium transition ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            Quay lại
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canProceed() || isSubmitting} // ✅ DISABLE KHI ĐANG LOADING
              className={`px-8 py-4 rounded-xl font-medium transition ${canProceed() && !isSubmitting ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Tiếp theo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting} // ✅ DISABLE KHI ĐANG LOADING
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
    </>
  );
}