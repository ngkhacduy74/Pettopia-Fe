import RegisterForm from '@/components/auth/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-teal-400 to-cyan-600">
        <Image
          src="/sampleimg/register-bg.jpg"
          alt="Register background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="opacity-90"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent"></div>
        
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4 ">Tham gia cùng chúng tôi</h1>
            <p className="text-lg text-teal-50 mb-8">
              Tạo tài khoản để trải nghiệm những tính năng tuyệt vời và kết nối với cộng đồng
            </p>
            {/* <div className="flex items-center justify-center gap-8 text-teal-100">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm">Người dùng</div>
              </div>
              <div className="w-px h-12 bg-teal-300/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-sm">Đánh giá</div>
              </div>
              <div className="w-px h-12 bg-teal-300/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm">Hỗ trợ</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Right half: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}