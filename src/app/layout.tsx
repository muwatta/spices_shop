import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mama Spice Store – Premium Nigerian Spices',
  description: 'Fresh, authentic Nigerian spices delivered to your door. Order online or via WhatsApp.',
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
