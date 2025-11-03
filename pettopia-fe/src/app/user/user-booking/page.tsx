'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';

// Mock data cho services
const mockServices = [
  { id: 'sv1', name: 'Khám tổng quát', price: 200000, duration: '30 phút', icon: '🏥' },
  { id: 'sv2', name: 'Tiêm phòng', price: 150000, duration: '15 phút', icon: '💉' },
  { id: 'sv3', name: 'Tắm và cắt tỉa lông', price: 300000, duration: '60 phút', icon: '✂️' },
  { id: 'sv4', name: 'Chăm sóc răng miệng', price: 250000, duration: '45 phút', icon: '🦷' },
  { id: 'sv5', name: 'Siêu âm', price: 400000, duration: '30 phút', icon: '📊' },
  { id: 'sv6', name: 'Xét nghiệm máu', price: 350000, duration: '20 phút', icon: '🔬' },
];

// Mock data cho pets
const mockPets = [
  { id: 'pet1', name: 'Milo', species: 'Chó', breed: 'Golden Retriever', avatar: '/sampleimg/default-pet.jpg' },
  { id: 'pet2', name: 'Luna', species: 'Mèo', breed: 'Mèo Ba Tư', avatar: '/sampleimg/default-pet.jpg' },
  { id: 'pet3', name: 'Max', species: 'Chó', breed: 'Husky', avatar: '/sampleimg/default-pet.jpg' },
  { id: 'pet4', name: 'Bella', species: 'Mèo', breed: 'Mèo Anh', avatar: '/sampleimg/default-pet.jpg' },
];

export default function AppointmentBooking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [petServiceMap, setPetServiceMap] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  // Generate available time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Toggle service selection
  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        // Remove service and all pets associated with it
        const newMap = { ...petServiceMap };
        Object.keys(newMap).forEach(petId => {
          newMap[petId] = newMap[petId].filter(sId => sId !== serviceId);
          if (newMap[petId].length === 0) delete newMap[petId];
        });
        setPetServiceMap(newMap);
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Toggle pet for a service
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

  // Check if can proceed to next step
  const canProceed = () => {
    if (currentStep === 1) return selectedDate && selectedTime;
    if (currentStep === 2) return selectedServices.length > 0;
    if (currentStep === 3) return Object.keys(petServiceMap).length > 0;
    return false;
  };

  // Calculate total price
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

  // Handle booking submission
  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reset form
      setCurrentStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedServices([]);
      setPetServiceMap({});
    }, 3000);
  };

  const [showSearch, setShowSearch] = useState(false);  

  return (
   <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
               <UserNavbar setShowSearch={setShowSearch} showSearch={showSearch} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Đặt lịch hẹn</h1>
            <p className="text-gray-600">Chăm sóc thú cưng của bạn với dịch vụ chuyên nghiệp</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
                    currentStep >= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-24 h-1 mx-2 transition ${
                      currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="grid grid-cols-4 gap-8 text-center max-w-3xl">
                <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-500'}`}>
                  Chọn ngày giờ
                </span>
                <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-500'}`}>
                  Chọn dịch vụ
                </span>
                <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-500'}`}>
                  Chọn thú cưng
                </span>
                <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-teal-600' : 'text-gray-500'}`}>
                  Xác nhận
                </span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 min-h-96"
          >
            {/* Step 1: Date & Time Selection */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Chọn ngày và giờ khám</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Chọn ngày</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Chọn giờ</label>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-lg font-medium transition ${
                            selectedTime === time
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {selectedDate && selectedTime && (
                  <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                    <p className="text-teal-800">
                      <span className="font-semibold">Thời gian đã chọn:</span>{' '}
                      {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} lúc {selectedTime}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Service Selection */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Chọn dịch vụ</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                        selectedServices.includes(service.id)
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className="text-4xl mr-4">{service.icon}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{service.duration}</p>
                            <p className="text-lg font-semibold text-teal-600 mt-2">
                              {service.price.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
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
                {selectedServices.length > 0 && (
                  <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                    <p className="text-teal-800">
                      <span className="font-semibold">Đã chọn {selectedServices.length} dịch vụ</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Pet Selection */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Chọn thú cưng cho từng dịch vụ</h2>
                <div className="space-y-8">
                  {selectedServices.map((serviceId) => {
                    const service = mockServices.find(s => s.id === serviceId);
                    return (
                      <div key={serviceId} className="border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <span className="text-3xl mr-3">{service.icon}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {mockPets.map((pet) => (
                            <div
                              key={pet.id}
                              onClick={() => togglePetService(pet.id, serviceId)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition flex items-center ${
                                petServiceMap[pet.id]?.includes(serviceId)
                                  ? 'border-teal-600 bg-teal-50'
                                  : 'border-gray-200 hover:border-teal-300'
                              }`}
                            >
                              <img
                                src={pet.avatar}
                                alt={pet.name}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                              />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{pet.name}</h4>
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
                {Object.keys(petServiceMap).length > 0 && (
                  <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                    <p className="text-teal-800">
                      <span className="font-semibold">Đã chọn {Object.keys(petServiceMap).length} thú cưng</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Xác nhận đặt lịch</h2>
                <div className="space-y-6">
                  {/* Date & Time */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Thời gian
                    </h3>
                    <p className="text-gray-700">
                      {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} lúc {selectedTime}
                    </p>
                  </div>

                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Chi tiết đặt lịch
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(petServiceMap).map(([petId, serviceIds]) => {
                        const pet = mockPets.find(p => p.id === petId);
                        return (
                          <div key={petId} className="border-l-4 border-teal-600 pl-4">
                            <div className="flex items-center mb-2">
                              <img
                                src={pet.avatar}
                                alt={pet.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900">{pet.name}</h4>
                                <p className="text-sm text-gray-600">{pet.breed}</p>
                              </div>
                            </div>
                            <ul className="space-y-2 ml-13">
                              {serviceIds.map(sId => {
                                const service = mockServices.find(s => s.id === sId);
                                return (
                                  <li key={sId} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{service.icon} {service.name}</span>
                                    <span className="font-semibold text-gray-900">
                                      {service.price.toLocaleString('vi-VN')}đ
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-teal-50 rounded-lg p-6 border-2 border-teal-600">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-3xl font-bold text-teal-600">
                        {calculateTotal().toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Quay lại
            </button>
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  canProceed()
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Tiếp theo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Xác nhận đặt lịch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Đặt lịch thành công!</h3>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã nhận được yêu cầu đặt lịch của bạn. Bạn sẽ nhận được xác nhận qua email và SMS sớm nhất.
              </p>
              <div className="bg-teal-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-teal-800">
                  <span className="font-semibold">Mã đặt lịch:</span> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
              <p className="text-sm text-gray-500">Trang sẽ tự động làm mới sau giây lát...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}