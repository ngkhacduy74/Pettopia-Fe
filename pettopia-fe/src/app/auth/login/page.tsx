import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left half: Form */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <div className="relative w-full h-full max-h-[800px] rounded-lg ">
          <Image
            src="/sampleimg/catlogin.jpg"
            alt="Login background"
            fill
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            priority
          />
        </div>
      </div>
      {/* Right half: Image with frame */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}