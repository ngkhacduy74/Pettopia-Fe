'use client';

import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';



interface PetInfo {
  id: string;
  name: string;
  species?: string;
  gender?: string;
  breed?: string;
  color?: string;
  weight?: number;
  dateOfBirth?: string;
  owner?: {
    user_id?: string;
    fullname?: string;
    phone?: string;
    email?: string;
    address?: {
      city?: string;
      district?: string;
      ward?: string;
      description?: string;
    };
  };
  avatar_url?: string;
  qr_code_url?: string;
  medical_records?: any[];
}

export default function QRScanPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatDate = (iso?: string) => {
    if (!iso) return 'Chưa rõ';
    try {
      return new Date(iso).toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  const formatGender = (gender?: string) => {
    if (!gender) return 'Chưa rõ';
    const genderLower = gender.toLowerCase();
    if (genderLower === 'male' || genderLower === 'đực') return 'Đực';
    if (genderLower === 'female' || genderLower === 'cái') return 'Cái';
    return gender;
  };

  const extractPetIdFromUrl = (url: string): string | null => {
    try {
      // Pattern: 3000/api/v1/pet/{petId}/info hoặc localhost:3333/api/v1/pet/{petId}/info
      const match = url.match(/\/pet\/([a-f0-9-]+)\/info/i);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchPetInfo = async (petId: string) => {
    try {
      setLoading(true);
      setError('');
      const apiUrl = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${petId}/info`;
      const response = await axios.get(apiUrl);
      const data = response.data;
      
      console.log('API Response:', data); // Thêm log để kiểm tra dữ liệu trả về
      
      setPetInfo({
        id: data.id || petId,
        name: data.name || '',
        species: data.species,
        gender: data.gender,
        breed: data.breed,
        color: data.color,
        weight: data.weight,
        dateOfBirth: data.dateOfBirth,
        owner: data.owner,
        avatar_url: data.avatar_url,
        qr_code_url: data.qr_code_url,
        medical_records: data.medical_records || []
      });
    } catch (err: any) {
      console.error('Error fetching pet info:', err);
      if (err.response?.status === 404) {
        setError('Không tìm thấy thông tin thú cưng với mã này.');
      } else {
        setError('Lỗi khi kết nối tới server. Vui lòng thử lại sau.');
      }
      setPetInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError('');
        setPetInfo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Vui lòng chọn ảnh trước khi quét');
      return;
    }

    setIsScanning(true);
    setError('');
    setPetInfo(null);

    try {
      // Tạo image element để decode QR code
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) {
            setError('Không thể khởi tạo canvas để quét QR code');
            setIsScanning(false);
            return;
          }

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            setError('Không thể khởi tạo context để quét QR code');
            setIsScanning(false);
            return;
          }

          // Resize image if too large for better performance
          const maxDimension = 1000;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = width * ratio;
            height = height * ratio;
          }

          // Set canvas size to image size
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Scan QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            const qrData = code.data;
            console.log('QR Code detected:', qrData);
            
            // Extract pet ID from URL
            const petId = extractPetIdFromUrl(qrData);
            
            if (petId) {
              // Fetch pet info from API
              fetchPetInfo(petId);
            } else {
              setError('Mã QR không hợp lệ. Vui lòng đảm bảo đây là mã QR của thú cưng Pettopia.');
              setIsScanning(false);
            }
          } else {
            setError('Không thể đọc mã QR. Vui lòng thử lại với ảnh rõ hơn hoặc đảm bảo mã QR không bị che khuất.');
            setIsScanning(false);
          }
        } catch (err) {
          console.error('Error processing QR code:', err);
          setError('Lỗi khi xử lý mã QR. Vui lòng thử lại.');
          setIsScanning(false);
        }
      };

      img.onerror = () => {
        setError('Lỗi khi tải ảnh. Vui lòng thử lại.');
        setIsScanning(false);
      };

      img.src = selectedImage;
    } catch (err) {
      console.error('Error scanning QR code:', err);
      setError('Lỗi khi quét mã QR. Vui lòng thử lại.');
      setIsScanning(false);
    }
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
    <div className="bg-gradient-to-b from-teal-50 to-white">
  

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
              <h2 className="text-2xl font-bold mb-3 mb-8">Căn Cước Thú Cưng Điện Tử</h2>
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
                  disabled={isScanning || loading}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {(isScanning || loading) ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{loading ? 'Đang tải thông tin...' : 'Đang quét...'}</span>
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

            {/* Hidden canvas for QR code scanning */}
            <canvas ref={canvasRef} className="hidden" />
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {petInfo.avatar_url ? (
                      <img src={petInfo.avatar_url} alt={petInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">{petInfo.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-3xl font-bold text-gray-900 truncate">{petInfo.name}</h4>
                    <p className="text-teal-600 font-medium truncate">{petInfo.breed || 'Chưa rõ'}</p>
                    <p className="text-sm text-gray-500 truncate">{petInfo.color || 'Chưa rõ'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Loài</p>
                    <p className="font-semibold text-gray-900">{petInfo.species || 'Chưa rõ'}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Giới tính</p>
                    <p className="font-semibold text-gray-900">{formatGender(petInfo.gender)}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Ngày sinh</p>
                    <p className="font-semibold text-gray-900">{formatDate(petInfo.dateOfBirth)}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cân nặng</p>
                    <p className="font-semibold text-gray-900">{petInfo.weight ? `${petInfo.weight} kg` : 'Chưa rõ'}</p>
                  </div>
                </div>

                {petInfo.owner && (
                  <div className="bg-cyan-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Chủ sở hữu</p>
                    <p className="font-semibold text-gray-900">{petInfo.owner.fullname || 'Chưa có thông tin'}</p>
                    {petInfo.owner.phone && (
                      <p className="text-sm text-teal-600 mt-1">📞 {petInfo.owner.phone}</p>
                    )}
                    {petInfo.owner.address && (
                      <p className="text-xs text-gray-600 mt-1">
                        {[
                          petInfo.owner.address.ward,
                          petInfo.owner.address.district,
                          petInfo.owner.address.city
                        ].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Mã thú cưng</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm break-all">{petInfo.id}</p>
                </div>

                {petInfo.medical_records && petInfo.medical_records.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Hồ sơ bệnh án</p>
                    <div className="space-y-2">
                      {petInfo.medical_records.map((record, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          {record.medicalRecord && (
                            <>
                              <p className="text-sm font-medium">Ngày tạo: {formatDate(record.medicalRecord.createdAt)}</p>
                              {record.medicalRecord.symptoms && <p className="text-sm text-gray-600">Triệu chứng: {record.medicalRecord.symptoms}</p>}
                              {record.medicalRecord.diagnosis && <p className="text-sm text-gray-600">Chẩn đoán: {record.medicalRecord.diagnosis}</p>}
                              {record.medicalRecord.notes && <p className="text-sm text-gray-600">Ghi chú: {record.medicalRecord.notes}</p>}
                            </>
                          )}
                          {record.medications && record.medications.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Thuốc:</p>
                              {record.medications.map((med: any, medIndex: number) => (
                                <div key={medIndex} className="text-sm text-gray-600 ml-2">
                                  <p><strong>{med.medication_name}</strong> - Liều: {med.dosage}</p>
                                  <p>Hướng dẫn: {med.instructions}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/user/pet/${petInfo.id}`}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition shadow-lg text-center block"
                >
                  Xem Hồ Sơ Đầy Đủ
                </Link>
              </motion.div>
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
      </div>

      <Footer />
    </div>
  );
}
