import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YT Downloader - Modern & Fast',
  description: 'Download YouTube videos in various formats and qualities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-50 min-h-screen antialiased selection:bg-rose-500/30`}>
        {children}
      </body>
    </html>
  );
}
