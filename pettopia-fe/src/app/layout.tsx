import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PawsHealth - Pet Hospital',
  description: 'Exceptional care for your furry family members',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}