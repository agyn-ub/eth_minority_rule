import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { ConnectButton } from '@/components/ConnectButton';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Minority Rule Game',
  description: 'On-chain voting game where only the minority advances',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Minority Rule</h1>
                </Link>
                <nav className="flex items-center gap-6">
                  <Link href="/" className="text-sm hover:underline">
                    Games
                  </Link>
                  <Link href="/create" className="text-sm hover:underline">
                    Create Game
                  </Link>
                  <ConnectButton />
                </nav>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              <p>Minority Rule Game • Built on Base</p>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
