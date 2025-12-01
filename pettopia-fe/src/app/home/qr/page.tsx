'use client';

import { useState, useRef } from 'react';

// Component Header giả lập
function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg"></div>
            <h1 className="text-2xl font-bold text-gray-900">Pettopia</h1>
          </div>
          <nav className="flex space-x-6">
            <a href="/" className="text-gray-600 hover:text-teal-600">Trang chủ</a>
            <a href="/services" className="text-gray-600 hover:text-teal-600">Dịch vụ</a>
            <a href="/qr-scan" className="text-teal-600 font-medium">Quét QR</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Component Footer giả lập
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Pettopia</h3>
            <p className="text-gray-400">Chăm sóc thú cưng tận tâm</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <p className="text-gray-400 text-sm">Email: info@pettopia.vn</p>
            <p className="text-gray-400 text-sm">Phone: 0900 000 000</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>Khám tổng quát</li>
              <li>Tiêm chủng</li>
              <li>Phẫu thuật</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Theo dõi</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © 2024 Pettopia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function QRScanPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [petInfo, setPetInfo] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Mock data - trong thực tế sẽ gọi API
  const mockPetDatabase = {
    'PET001': {
      name: 'Milu',
      species: 'Chó',
      breed: 'Golden Retriever',
      age: '3 tuổi',
      gender: 'Đực',
      owner: 'Nguyễn Văn A',
      ownerPhone: '0901234567',
      lastCheckup: '15/11/2024',
      vaccinations: ['Dại', 'Parvo', 'Distemper'],
      microchip: 'PET001',
      weight: '28 kg',
      color: 'Vàng đồng',
      notes: 'Thú cưng khỏe mạnh, hoạt bát'
    },
    'PET002': {
      name: 'Lucy',
      species: 'Mèo',
      breed: 'Mèo Ba Tư',
      age: '2 tuổi',
      gender: 'Cái',
      owner: 'Trần Thị B',
      ownerPhone: '0912345678',
      lastCheckup: '20/11/2024',
      vaccinations: ['Dại', 'FeLV', 'FIV'],
      microchip: 'PET002',
      weight: '4.5 kg',
      color: 'Trắng xám',
      notes: 'Cần chế độ ăn đặc biệt'
    },
    'PET003': {
      name: 'Max',
      species: 'Chó',
      breed: 'Husky Siberia',
      age: '4 tuổi',
      gender: 'Đực',
      owner: 'Lê Văn C',
      ownerPhone: '0923456789',
      lastCheckup: '10/11/2024',
      vaccinations: ['Dại', 'Parvo', 'Distemper', 'Leptospirosis'],
      microchip: 'PET003',
      weight: '24 kg',
      color: 'Đen trắng',
      notes: 'Năng động, cần vận động nhiều'
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setError('');
        setPetInfo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setError('');
    
    // Giả lập quá trình quét (2 giây)
    setTimeout(() => {
      // Random chọn một pet từ database để demo
      const petIds = Object.keys(mockPetDatabase);
      const randomPetId = petIds[Math.floor(Math.random() * petIds.length)];
      
      // 85% thành công, 15% thất bại để demo
      if (Math.random() > 0.15) {
        setPetInfo(mockPetDatabase[randomPetId]);
        setError('');
      } else {
        setError('Không thể đọc mã QR. Vui lòng thử lại với ảnh rõ hơn hoặc đảm bảo mã QR không bị che khuất.');
        setPetInfo(null);
      }
      setIsScanning(false);
    }, 2000);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPetInfo(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Giải thích tính năng */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 mb-12 text-white shadow-xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Căn Cước Thú Cưng Điện Tử</h2>
              <p className="text-cyan-50 text-lg leading-relaxed">
                Mỗi thú cưng đăng ký tại Pettopia đều có một mã QR duy nhất - giống như căn cước công dân cho thú cưng của bạn! 
                Chỉ cần quét mã này, bạn có thể xem toàn bộ thông tin sức khỏe, lịch sử tiêm chủng, và các cuộc khám gần đây. 
                Tính năng này đặc biệt hữu ích khi:
              </p>
              <ul className="mt-4 space-y-2 text-cyan-50">
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Khám cấp cứu - bác sĩ có thể nhanh chóng truy cập hồ sơ bệnh án</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Thú cưng bị lạc - người tìm thấy có thể liên hệ chủ nhân ngay</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Chia sẻ thông tin với người chăm sóc thú cưng tạm thời</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Phần Upload/Scan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-cyan-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quét Mã QR</h3>
            
            {!selectedImage ? (
              <div className="space-y-4">
                <div 
                  className="border-4 border-dashed border-teal-300 rounded-xl p-12 text-center hover:border-teal-500 transition cursor-pointer bg-teal-50/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-16 h-16 text-teal-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Tải ảnh mã QR lên
                  </p>
                  <p className="text-sm text-gray-500">
                    Chọn ảnh chứa mã QR từ thiết bị của bạn
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Chọn Ảnh</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="QR Code"
                    className="w-full h-64 object-contain bg-gray-100 rounded-xl"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang quét...</span>
                    </span>
                  ) : (
                    'Quét Mã QR'
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phần Hiển thị Thông tin */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-cyan-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Thú Cưng</h3>
            
            {!petInfo ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg font-medium">Chưa có thông tin</p>
                <p className="text-sm text-center px-4">Vui lòng quét mã QR để xem thông tin thú cưng</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                    {petInfo.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-gray-900">{petInfo.name}</h4>
                    <p className="text-teal-600 font-medium">{petInfo.breed}</p>
                    <p className="text-sm text-gray-500">{petInfo.color}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Loài</p>
                    <p className="font-semibold text-gray-900">{petInfo.species}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tuổi</p>
                    <p className="font-semibold text-gray-900">{petInfo.age}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Giới tính</p>
                    <p className="font-semibold text-gray-900">{petInfo.gender}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cân nặng</p>
                    <p className="font-semibold text-gray-900">{petInfo.weight}</p>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Chủ sở hữu</p>
                  <p className="font-semibold text-gray-900">{petInfo.owner}</p>
                  <p className="text-sm text-teal-600 mt-1">📞 {petInfo.ownerPhone}</p>
                </div>

                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Tiêm chủng</p>
                  <div className="flex flex-wrap gap-2">
                    {petInfo.vaccinations.map((vac, index) => (
                      <span
                        key={index}
                        className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        ✓ {vac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Khám gần nhất</p>
                  <p className="font-semibold text-gray-900">{petInfo.lastCheckup}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Mã chip</p>
                  <p className="font-mono font-semibold text-gray-900">{petInfo.microchip}</p>
                </div>

                {petInfo.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                    <p className="text-gray-900">{petInfo.notes}</p>
                  </div>
                )}

                <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition shadow-lg">
                  Xem Hồ Sơ Đầy Đủ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hướng dẫn sử dụng */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-cyan-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hướng Dẫn Sử Dụng</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Chụp hoặc tải ảnh</h4>
              <p className="text-sm text-gray-600">
                Chụp ảnh mã QR trên vòng cổ hoặc thẻ của thú cưng, hoặc tải ảnh có sẵn từ thiết bị
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Nhấn quét mã</h4>
              <p className="text-sm text-gray-600">
                Hệ thống sẽ tự động nhận diện và đọc mã QR từ ảnh bạn đã tải lên
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Xem thông tin</h4>
              <p className="text-sm text-gray-600">
                Thông tin đầy đủ về thú cưng sẽ hiển thị ngay lập tức, bao gồm chủ nhân và hồ sơ y tế
              </p>
            </div>
          </div>
        </div>

        {/* Mock Data Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Chế độ Demo - Dùng Mock Data</h4>
              <p className="text-sm text-yellow-800 mb-2">
                Trang này đang sử dụng dữ liệu mẫu để demo tính năng. Khi quét, hệ thống sẽ random hiển thị thông tin của một trong các thú cưng sau:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>Milu</strong> - Golden Retriever (PET001)</li>
                <li>• <strong>Lucy</strong> - Mèo Ba Tư (PET002)</li>
                <li>• <strong>Max</strong> - Husky Siberia (PET003)</li>
              </ul>
              <p className="text-sm text-yellow-800 mt-2">
                Trong phiên bản thực tế, hệ thống sẽ kết nối API để quét QR code thật và lấy dữ liệu từ database.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}