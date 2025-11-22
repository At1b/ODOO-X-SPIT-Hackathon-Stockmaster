import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-screen flex bg-background text-foreground">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 w-full flex flex-col">
        <Header onToggleSidebar={() => setMobileOpen((s) => !s)} />
        <main className="flex-1 w-full p-4">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
