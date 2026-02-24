'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ConnectButton } from '@/components/ConnectButton';
import { CreateGameModal } from '@/components/CreateGameModal';
import { WebSocketStatus } from '@/components/websocket-status';
import { SQUID_SHAPES } from '@/lib/squid-shapes';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6 pt-12">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <span className="text-primary">{SQUID_SHAPES.circle}</span>
            <span className="text-accent">{SQUID_SHAPES.triangle}</span>
            <span className="text-primary">{SQUID_SHAPES.square}</span>
            <span className="text-sm font-bold tracking-tight uppercase">
              Menu
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors py-2 border-b border-primary/10"
          >
            Games
          </Link>
          <Link
            href="/my-games"
            onClick={() => setOpen(false)}
            className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors py-2 border-b border-primary/10"
          >
            My Games
          </Link>
          <Link
            href="/players"
            onClick={() => setOpen(false)}
            className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors py-2 border-b border-primary/10"
          >
            Players
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors py-2 border-b border-primary/10"
          >
            How It Works
          </Link>
          <CreateGameModal
            trigger={
              <button
                className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors py-2 border-b border-primary/10 text-left"
                onClick={() => setOpen(false)}
              >
                Create Game
              </button>
            }
          />
        </nav>

        <div className="flex flex-col gap-4 mt-auto">
          <ConnectButton />
          <WebSocketStatus />
        </div>
      </SheetContent>
    </Sheet>
  );
}
