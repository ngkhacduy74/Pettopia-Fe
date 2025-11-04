'use client'

import { useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
import { div } from 'framer-motion/client';

const mockClinics = [
  { id: 'clinic1', name: 'Pettopia Hà Nội', address: 'Số 123 Đường Láng, Đống Đa, Hà Nội', phone: '024 1234 5678', image: '/sampleimg/logo-card.png', rating: 4.8 },
  { id: 'clinic2', name: 'Pettopia Hồ Chí Minh', address: 'Số 456 Nguyễn Huệ, Quận 1, TP.HCM', phone: '028 8765 4321', image: '/sampleimg/logo-card.png', rating: 4.9 },
  { id: 'clinic3', name: 'Pettopia Đà Nẵng', address: 'Số 789 Trần Phú, Hải Châu, Đà Nẵng', phone: '0236 3456 789', image: '/sampleimg/logo-card.png', rating: 4.7 },
];

const mockServices = [
  { id: 'sv1', name: 'Khám tổng quát', price: 200000, duration: '30 phút' },
  { id: 'sv2', name: 'Tiêm phòng', price: 150000, duration: '15 phút' },
  { id: 'sv3', name: 'Tắm và cắt tỉa lông', price: 300000, duration: '60 phút' },
  { id: 'sv4', name: 'Chăm sóc răng miệng', price: 250000, duration: '45 phút' },
  { id: 'sv5', name: 'Siêu âm', price: 400000, duration: '30 phút' },
  { id: 'sv6', name: 'Xét nghiệm máu', price: 350000, duration: '20 phút' },
];

const timeShifts = [
  { id: 'morning', name: 'Ca sáng', time: '08:00 - 12:00' },
  { id: 'afternoon', name: 'Ca chiều', time: '13:00 - 17:00' },
  { id: 'evening', name: 'Ca tối', time: '17:00 - 21:00' },
];

const mockPets = [
  { id: 'pet1', name: 'Milo', species: 'Chó', breed: 'Golden Retriever', avatar: '/sampleimg/default-pet.jpg' },
  { id: 'pet2', name: 'Luna', species: 'Mèo', breed: 'Mèo Ba Tư', avatar: '/sampleimg/default-pet.jpg' },
  { id: 'pet3', name: 'Max', species: 'Chó', breed: 'Husky', avatar: '/sampleimg/default-pet.jpg' },
  { id: 'pet4', name: 'Bella', species: 'Mèo', breed: 'Mèo Anh', avatar: '/sampleimg/default-pet.jpg' },
];

export default function AppointmentBooking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [petServiceMap, setPetServiceMap] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        const newMap = { ...petServiceMap };
        Object.keys(newMap).forEach(petId => {
          newMap[petId] = newMap[petId].filter(sId => sId !== serviceId);
          if (newMap[petId].length === 0) delete newMap[petId];
        });
        setPetServiceMap(newMap);
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const togglePetService = (petId, serviceId) => {
    setPetServiceMap(prev => {
      const newMap = { ...prev };
      if (!newMap[petId]) {
        newMap[petId] = [serviceId];
      } else {
        if (newMap[petId].includes(serviceId)) {
          newMap[petId] = newMap[petId].filter(sId => sId !== serviceId);
          if (newMap[petId].length === 0) delete newMap[petId];
        } else {
          newMap[petId] = [...newMap[petId], serviceId];
        }
      }
      return newMap;
    });
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedClinic !== '';
    if (currentStep === 2) return selectedDate && selectedShift;
    if (currentStep === 3) return selectedServices.length > 0;
    if (currentStep === 4) return Object.keys(petServiceMap).length > 0;
    return false;
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(petServiceMap).forEach(services => {
      services.forEach(serviceId => {
        const service = mockServices.find(s => s.id === serviceId);
        if (service) total += service.price;
      });
    });
    return total;
  };

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentStep(1);
      setSelectedClinic('');
      setSelectedDate('');
      setSelectedShift('');
      setSelectedServices([]);
      setPetServiceMap({});
    }, 3000);
  };
  const [showSearch, setShowSearch] = useState(false);  

  return (
   <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
               <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Đặt lịch hẹn</h1>
          <p className="text-gray-600">Chăm sóc thú cưng của bạn với dịch vụ chuyên nghiệp</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step}
                </div>
                {step < 5 && <div className={`w-20 h-1 mx-2 ${currentStep > step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="grid grid-cols-5 gap-6 text-center max-w-4xl">
              <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-500'}`}>Chọn phòng khám</span>
              <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-500'}`}>Chọn ngày & ca</span>
              <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-500'}`}>Chọn dịch vụ</span>
              <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-teal-600' : 'text-gray-500'}`}>Chọn thú cưng</span>
              <span className={`text-sm font-medium ${currentStep >= 5 ? 'text-teal-600' : 'text-gray-500'}`}>Xác nhận</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-96">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Chọn phòng khám</h2>
              <div className="grid gap-6">
                {mockClinics.map((clinic) => (
                  <div key={clinic.id} onClick={() => setSelectedClinic(clinic.id)} className={`p-6 rounded-xl border-2 cursor-pointer ${selectedClinic === clinic.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <img src={clinic.image} alt={clinic.name} className="w-16 h-16 rounded-lg mr-4" />
                        <div>
                          <h3 className="text-xl font-bold">{clinic.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{clinic.address}</p>
                          <p className="text-sm text-gray-600">{clinic.phone}</p>
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
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Chọn ngày và ca khám</h2>
              <div className="space-y-8">
                <div>
                  <label className="block font-semibold mb-3">Chọn ngày</label>
                  <input type="date" min={getMinDate()} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-teal-500" />
                  {selectedDate && <p className="mt-2 text-sm text-teal-600">Ngày đã chọn: {formatDate(selectedDate)}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-3">Chọn ca khám</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {timeShifts.map((shift) => (
                      <div key={shift.id} onClick={() => setSelectedShift(shift.id)} className={`p-6 rounded-xl border-2 cursor-pointer text-center ${selectedShift === shift.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                        <h3 className="text-lg font-bold mb-1">{shift.name}</h3>
                        <p className="text-sm text-gray-600">{shift.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Chọn dịch vụ</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {mockServices.map((service) => (
                  <div key={service.id} onClick={() => toggleService(service.id)} className={`p-6 rounded-xl border-2 cursor-pointer ${selectedServices.includes(service.id) ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{service.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.duration}</p>
                        <p className="text-lg font-semibold text-teal-600 mt-2">{service.price.toLocaleString('vi-VN')}đ</p>
                      </div>
                      {selectedServices.includes(service.id) && (
                        <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Chọn thú cưng cho từng dịch vụ</h2>
              <div className="space-y-8">
                {selectedServices.map((serviceId) => {
                  const service = mockServices.find(s => s.id === serviceId);
                  return (
                    <div key={serviceId} className="border-2 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4">{service.name}</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {mockPets.map((pet) => (
                          <div key={pet.id} onClick={() => togglePetService(pet.id, serviceId)} className={`p-4 rounded-lg border-2 cursor-pointer flex items-center ${petServiceMap[pet.id]?.includes(serviceId) ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                            <img src={pet.avatar} alt={pet.name} className="w-12 h-12 rounded-full mr-4" />
                            <div className="flex-1">
                              <h4 className="font-bold">{pet.name}</h4>
                              <p className="text-sm text-gray-600">{pet.breed}</p>
                            </div>
                            {petServiceMap[pet.id]?.includes(serviceId) && (
                              <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Xác nhận đặt lịch</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold mb-3">Phòng khám</h3>
                  <p className="font-semibold">{mockClinics.find(c => c.id === selectedClinic)?.name}</p>
                  <p className="text-sm text-gray-600">{mockClinics.find(c => c.id === selectedClinic)?.address}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold mb-3">Thời gian</h3>
                  <p>Ngày: {formatDate(selectedDate)}</p>
                  <p>Ca khám: {timeShifts.find(s => s.id === selectedShift)?.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold mb-4">Chi tiết đặt lịch</h3>
                  {Object.entries(petServiceMap).map(([petId, serviceIds]) => {
                    const pet = mockPets.find(p => p.id === petId);
                    return (
                      <div key={petId} className="mb-4 border-l-4 border-teal-600 pl-4">
                        <h4 className="font-bold">{pet.name} - {pet.breed}</h4>
                        <ul className="mt-2 space-y-1">
                          {serviceIds.map(sId => {
                            const service = mockServices.find(s => s.id === sId);
                            return (
                              <li key={sId} className="flex justify-between text-sm">
                                <span>{service.name}</span>
                                <span className="font-semibold">{service.price.toLocaleString('vi-VN')}đ</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-teal-50 rounded-lg p-6 border-2 border-teal-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Tổng cộng</span>
                    <span className="text-3xl font-bold text-teal-600">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className={`px-8 py-3 rounded-lg font-semibold ${currentStep === 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
            Quay lại
          </button>
          {currentStep < 5 ? (
            <button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()} className={`px-8 py-3 rounded-lg font-semibold ${canProceed() ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400'}`}>
              Tiếp theo
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">
              Xác nhận đặt lịch
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-3">Đặt lịch thành công!</h3>
            <p className="text-gray-600 mb-6">Chúng tôi đã nhận được yêu cầu đặt lịch của bạn.</p>
            <div className="bg-teal-50 rounded-lg p-4">
              <p className="text-sm text-teal-800"><span className="font-semibold">Mã đặt lịch:</span> #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}