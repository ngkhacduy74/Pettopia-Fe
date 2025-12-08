import React, { useState } from 'react';
import {
  ClipboardDocumentCheckIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type GuideType = 'clinic' | 'doctor' | null;

type StepField = {
  label: string;
  example: string;
  note?: string;
  required: boolean;
  formats?: string[];
};

type Step = {
  id: number;
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  fields?: StepField[];
  steps?: string[];
  example?: string;
  warning?: string;
  important?: boolean;
  suggestions?: string[];
};

export default function RegistrationGuide() {
  const [selectedGuide, setSelectedGuide] = useState<GuideType>(null);

  const clinicSteps: Step[] = [
    {
      id: 1,
      title: 'Thông tin cơ bản phòng khám',
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      fields: [
        {
          label: 'Tên phòng khám',
          example: 'Phòng khám Thú y PetCare',
          required: true,
        },
        {
          label: 'Email',
          example: 'contact@petcare.vn',
          note: 'Sẽ dùng để nhận thông báo',
          required: true,
        },
        {
          label: 'Số điện thoại',
          example: '0901234567',
          note: 'Bắt đầu bằng +84 hoặc 0',
          required: true,
        },
        {
          label: 'Số giấy phép hoạt động',
          example: '0123456789 hoặc 123/HNY hoặc 123/HNY-SNNPTNT',
          note: 'Nhập đúng số giấy phép do cơ quan thú y cấp',
          required: true,
          formats: ['10 chữ số: 0123456789', 'Dạng: 123/HNY hoặc 123/HNY-SNNPTNT'],
        },
      ],
    },
    {
      id: 2,
      title: 'Địa chỉ phòng khám',
      icon: <MapPinIcon className="w-5 h-5" />,
      important: true,
      steps: [
        'Chọn Tỉnh/Thành phố (chờ tải danh sách nếu mạng chậm)',
        'Chọn Quận/Huyện (tự động hiện sau khi chọn tỉnh)',
        'Chọn Phường/Xã (tự động hiện sau khi chọn quận/huyện)',
        'Nhập địa chỉ chi tiết: số nhà, tên đường, ngõ...',
      ],
      example: '123 đường Lê Lợi, ngõ 45',
      warning: 'Phải chọn đủ 3 cấp (Tỉnh → Quận → Phường) thì mới nhập được địa chỉ chi tiết',
    },
    {
      id: 3,
      title: 'Thông tin người đại diện',
      icon: <UserIcon className="w-5 h-5" />,
      subtitle: 'Người chịu trách nhiệm pháp lý',
      fields: [
        {
          label: 'Họ và tên người đại diện',
          example: 'Nguyễn Văn An',
          note: 'Chỉ được nhập chữ cái và dấu tiếng Việt',
          required: true,
        },
        {
          label: 'Số CMND/CCCD',
          example: '001234567890',
          note: 'Nhập 9 hoặc 12 số (không có dấu chấm hay khoảng trắng)',
          required: true,
        },
        {
          label: 'Giấy phép hành nghề',
          example: '01234, 05678, 091234',
          note: 'Các số giấy phép của bác sĩ chính (cách nhau bằng dấu phẩy)',
          required: true,
        },
        {
          label: 'Ngày cấp giấy phép',
          example: '01/01/2024',
          note: 'Chọn ngày cấp gần nhất của bác sĩ chính',
          required: false,
        },
      ],
    },
  ];

  const doctorSteps: Step[] = [
    {
      id: 1,
      title: 'Chuyên môn',
      icon: <AcademicCapIcon className="w-5 h-5" />,
      fields: [
        {
          label: 'Chuyên môn chính',
          example: 'Thú y nội khoa, Phẫu thuật thú y, Da liễu thú y',
          required: true,
        },
        {
          label: 'Chuyên môn phụ (tối đa 3)',
          example: 'Chẩn đoán siêu âm, Nha khoa thú y, Hành vi học',
          note: 'Bấm "+ Thêm chuyên môn phụ" để thêm ô nhập. Muốn xóa → bấm nút Xóa màu đỏ',
          required: false,
        },
      ],
    },
    {
      id: 2,
      title: 'Kinh nghiệm & Mạng xã hội',
      icon: <BriefcaseIcon className="w-5 h-5" />,
      fields: [
        {
          label: 'Kinh nghiệm',
          example: '5, 12, 25',
          note: 'Nhập số năm kinh nghiệm thực tế (từ 0 đến 50)',
          required: true,
        },
        {
          label: 'Facebook',
          example: 'https://facebook.com/tenban',
          note: 'Dán link trang cá nhân hoặc fanpage. Phải có dạng: https://facebook.com/...',
          required: false,
        },
        {
          label: 'LinkedIn',
          example: 'https://linkedin.com/in/tenban',
          note: 'Dán link LinkedIn (nếu có)',
          required: false,
        },
      ],
    },
    {
      id: 3,
      title: 'Giới thiệu bản thân',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      important: true,
      fields: [
        {
          label: 'Giới thiệu',
          example: 'Tốt nghiệp Đại học Nông Lâm TP.HCM năm 2015. Hiện đang công tác tại Bệnh viện Thú y PetCare. Đặc biệt yêu thích phẫu thuật chỉnh hình và hồi sức cấp cứu. Đã thực hiện hơn 800 ca mổ thành công...',
          note: 'Viết ít nhất 50 ký tự',
          required: true,
        },
      ],
      suggestions: [
        'Quá trình học tập, công tác',
        'Phong cách làm việc, triết lý chăm sóc thú cưng',
        'Thành tựu nổi bật, giải thưởng (nếu có)',
      ],
    },
    {
      id: 4,
      title: 'Chứng chỉ & Giấy phép',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      fields: [
        {
          label: 'Chứng chỉ, bằng cấp (tối đa 5)',
          example: 'Chứng chỉ Phẫu thuật cao cấp AVMA',
          note: 'Bấm "+ Thêm chứng chỉ" để thêm dòng mới. Link ảnh chứng chỉ (Google Drive, Imgur...) không bắt buộc nhưng tăng độ tin cậy!',
          required: true,
        },
        {
          label: 'Số giấy phép hành nghề',
          example: '0123456789 hoặc 123/HNY, 456/BV-TY',
          note: 'Nhập chính xác số trên giấy phép do Bộ Nông nghiệp cấp',
          required: true,
          formats: ['10 chữ số: 0123456789', 'Hoặc: 123/HNY, 456/BV-TY'],
        },
        {
          label: 'Link ảnh giấy phép',
          example: 'https://drive.google.com/...',
          note: 'Khuyến khích: Dán link ảnh chụp rõ giấy phép (tăng tốc độ duyệt hồ sơ!)',
          required: false,
        },
      ],
    },
  ];

  const clinicErrors = [
    {
      error: 'Không thể tải tỉnh/thành phố',
      solution: 'Bấm nút "Thử lại" màu đỏ hoặc tải lại trang',
    },
    {
      error: 'Vui lòng chọn đầy đủ địa chỉ...',
      solution: 'Phải chọn đủ Tỉnh → Quận → Phường trước khi bấm Lưu',
    },
    {
      error: 'Số điện thoại không hợp lệ',
      solution: 'Phải là số Việt Nam 10 số, bắt đầu bằng 03/05/07/08/09',
    },
    {
      error: 'Phiên đăng nhập hết hạn',
      solution: 'Đăng nhập lại tài khoản của bạn',
    },
  ];

  const doctorErrors = [
    {
      error: 'Vui lòng nhập chuyên môn chính',
      solution: 'Điền ô Chuyên môn chính',
    },
    {
      error: 'Tối thiểu 50 ký tự (phần giới thiệu)',
      solution: 'Viết dài hơn, ít nhất 2-3 câu',
    },
    {
      error: 'URL Facebook không hợp lệ',
      solution: 'Copy đúng link đầy đủ: https://www.facebook.com/tenban',
    },
    {
      error: 'Không hợp lệ (10 số hoặc 123/HNY...)',
      solution: 'Kiểm tra lại số giấy phép, viết HOA, đúng định dạng',
    },
    {
      error: 'Nút "Gửi thông tin" vẫn xám',
      solution: 'Còn lỗi đỏ nào đó → kéo lên tìm và sửa hết lỗi',
    },
  ];

  if (selectedGuide === null) {
    return (
      <div className="flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Hướng dẫn đăng ký
            </h1>
            <p className="text-lg text-gray-600">
              Chọn loại hình đăng ký của bạn để xem hướng dẫn chi tiết
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              onClick={() => setSelectedGuide('clinic')}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <BuildingOffice2Icon className="w-6 h-6 text-gray-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Phòng khám
              </h2>
              <p className="text-gray-600 mb-4">
                Hướng dẫn đăng ký và hoàn thiện hồ sơ phòng khám thú y
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Thông tin cơ bản phòng khám</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Địa chỉ chi tiết</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Người đại diện pháp lý</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>Duyệt trong 1-3 ngày</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedGuide('doctor')}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <UserIcon className="w-6 h-6 text-gray-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bác sĩ thú y
              </h2>
              <p className="text-gray-600 mb-4">
                Hướng dẫn hoàn thiện hồ sơ cá nhân bác sĩ thú y
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Chuyên môn & Kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Giới thiệu bản thân</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Chứng chỉ & Giấy phép</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>Duyệt trong 24-72 giờ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = selectedGuide === 'clinic' ? clinicSteps : doctorSteps;
  const errors = selectedGuide === 'clinic' ? clinicErrors : doctorErrors;
  const title = selectedGuide === 'clinic' ? 'Hướng dẫn đăng ký phòng khám' : 'Hướng dẫn hoàn thiện hồ sơ bác sĩ';
  const subtitle = selectedGuide === 'clinic' 
    ? 'Vui lòng điền đầy đủ và chính xác các thông tin để hoàn tất hồ sơ'
    : 'Chào bác sĩ! Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ cá nhân';
  const buttonText = selectedGuide === 'clinic' ? 'Lưu thông tin' : 'Gửi thông tin';
  const reviewTime = selectedGuide === 'clinic' ? '1-3 ngày làm việc' : '24-72 giờ';

  return (
    <div >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedGuide(null)}
          className="mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Quay lại chọn loại hình
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg mb-4">
            {selectedGuide === 'clinic' ? (
              <BuildingOffice2Icon className="w-6 h-6 text-gray-700" />
            ) : (
              <UserIcon className="w-6 h-6 text-gray-700" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-3">{subtitle}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>Thời gian xét duyệt: {reviewTime}</span>
          </div>
        </div>

        <div className="space-y-8 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="border-l-4 border-gray-300 pl-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-500">Bước {index + 1}</span>
                    {step.important && (
                      <span className="px-2 py-0.5 text-gray-700 text-xs font-semibold rounded">
                        QUAN TRỌNG
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                  {step.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{step.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {step.fields && (
                  <div className="space-y-3">
                    {step.fields.map((field, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{field.label}</h3>
                          {field.required && (
                            <span className="text-red-600 text-xs">*</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Ví dụ:</span> {field.example}
                        </p>
                        {field.note && (
                          <p className="text-xs text-gray-500">{field.note}</p>
                        )}
                        {field.formats && (
                          <div className="mt-2 space-y-1">
                            {field.formats.map((format, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircleIcon className="w-3 h-3" />
                                {format}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {step.steps && (
                  <div className="space-y-2">
                    {step.steps.map((stepItem, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-gray-700 text-sm pt-0.5">{stepItem}</p>
                      </div>
                    ))}
                    {step.example && (
                      <div className="mt-3 p-3 border border-gray-200 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Ví dụ:</span> {step.example}
                        </p>
                      </div>
                    )}
                    {step.warning && (
                      <div className="mt-3 p-3 border border-gray-300 rounded flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{step.warning}</p>
                      </div>
                    )}
                  </div>
                )}

                {step.suggestions && (
                  <div className="p-3 border border-gray-200 rounded">
                    <p className="font-semibold text-gray-900 mb-2 text-sm">Gợi ý nội dung:</p>
                    <ul className="space-y-1">
                      {step.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6" />
            Gửi hồ sơ
          </h2>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>• Sau khi điền xong → nhấn nút <span className="font-bold">"{buttonText}"</span></p>
            <div className="pl-4 space-y-2">
              <p className="font-semibold">Nút chỉ bật khi:</p>
              <div className="space-y-1 pl-4">
                <p>✓ Tất cả các trường bắt buộc đã hợp lệ</p>
                <p>✓ Không còn lỗi đỏ nào hiện dưới các ô</p>
                {selectedGuide === 'clinic' && <p>✓ Đã tải xong danh sách tỉnh/quận/xã</p>}
              </div>
            </div>
            <div className="mt-3 p-3 border border-gray-200 rounded">
              <p className="font-semibold mb-1">Nếu thành công:</p>
              <p>Bạn sẽ thấy thông báo "Đăng ký {selectedGuide === 'clinic' ? 'phòng khám' : 'bác sĩ'} thành công!" và được chuyển đến trang chờ xét duyệt.</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Lỗi thường gặp & cách khắc phục
          </h2>
          <div className="space-y-3">
            {errors.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <p className="font-semibold mb-1 text-sm text-gray-900">❌ {item.error}</p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">✓ Giải pháp:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Sau khi gửi thành công</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✓ Bạn sẽ được chuyển đến trang "Đang chờ duyệt"</p>
            <p>✓ Chúng tôi sẽ liên hệ qua email/số điện thoại trong vòng {reviewTime}</p>
            <p>✓ Khi được duyệt, bạn có thể {selectedGuide === 'clinic' ? 'đăng nhập và bắt đầu sử dụng đầy đủ tính năng' : 'nhận lịch khám online, quản lý bệnh án, tư vấn từ xa'}</p>
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
          <p className="text-lg font-bold text-gray-900 mb-4">
            {selectedGuide === 'clinic' ? 'Chúc bạn đăng ký thành công!' : 'Chúc bác sĩ hoàn thiện hồ sơ thành công!'} 🎉
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              <span>Hotline: <span className="font-semibold">1900 1234</span></span>
            </div>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              <span>Email: <span className="font-semibold">{selectedGuide === 'clinic' ? 'support@petcare.vn' : 'doctor@petcare.vn'}</span></span>
            </div>
            {selectedGuide === 'doctor' && (
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4" />
                <span>Zalo OA: <span className="font-semibold">PetCare Việt Nam</span></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}