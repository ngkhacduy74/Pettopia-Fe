import type { Metadata } from 'next';
import '../globals.css';
export const metadata: Metadata = {
  title: 'Trang chủ - Pettopia',
  description: 'Trang chủ dành cho người dùng đã đăng nhập',
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
    </section>
  );
}