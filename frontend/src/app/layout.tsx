import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { ConnectButton } from '@/components/ConnectButton';
import { CreateGameModal } from '@/components/CreateGameModal';
import { NetworkWarningBanner } from '@/components/NetworkWarningBanner';
import { WebSocketStatus } from '@/components/websocket-status';
import Link from 'next/link';
import { SQUID_BRAND, SQUID_SHAPES } from '@/lib/squid-shapes';

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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <NetworkWarningBanner />
          <div className="min-h-screen flex flex-col">
            {/* Header - Squid Game Style */}
            <header className="border-b border-primary/30 bg-card sticky top-0 z-50">
              <div className="container mx-auto px-4 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="flex items-center gap-1 text-lg">
                    <span className="text-primary">{SQUID_SHAPES.circle}</span>
                    <span className="text-accent">{SQUID_SHAPES.triangle}</span>
                    <span className="text-primary">{SQUID_SHAPES.square}</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">
                      MINORITY RULE
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono tracking-wide">
                      ONLY THE MINORITY SURVIVES
                    </p>
                  </div>
                </Link>
                <nav className="flex items-center gap-8">
                  <Link
                    href="/"
                    className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors relative group"
                  >
                    Games
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-[width]"></span>
                  </Link>
                  <Link
                    href="/my-games"
                    className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors relative group"
                  >
                    My Games
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-[width]"></span>
                  </Link>
                  <Link
                    href="/players"
                    className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors relative group"
                  >
                    Players
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-[width]"></span>
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors relative group"
                  >
                    How It Works
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-[width]"></span>
                  </Link>
                  <CreateGameModal
                    trigger={
                      <button className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors relative group">
                        Create Game
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-[width]"></span>
                      </button>
                    }
                  />
                  <ConnectButton />
                  <WebSocketStatus />
                </nav>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-10">{children}</main>

            <footer className="border-t border-primary/20 py-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-primary">{SQUID_SHAPES.circle}</span>
                <span className="text-accent">{SQUID_SHAPES.triangle}</span>
                <span className="text-primary">{SQUID_SHAPES.square}</span>
              </div>
              <p className="text-sm font-bold tracking-wider uppercase mb-1">
                Minority Rule Game
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Built on Base • Only the minority survives
              </p>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
