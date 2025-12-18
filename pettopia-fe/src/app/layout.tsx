import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/contexts/ToastContext';
import './globals.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Pettopia',
  description: 'Exceptional care for your furry family members',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <ToastProvider>
          <Toaster />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}