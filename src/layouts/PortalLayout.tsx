import { useCallback, useMemo, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/CommandPalette";
import { PortalFooter } from "@/components/PortalFooter";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/AppSidebar";
import { PortalContext } from "@/layouts/portal-context";
import { TopNav } from "@/layouts/TopNav";

export function PortalLayout({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const openCommandPalette = useCallback(() => setCommandOpen(true), []);
  const contextValue = useMemo(() => ({ openCommandPalette }), [openCommandPalette]);

  return (
    <PortalContext.Provider value={contextValue}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col bg-background">
            <TopNav onOpenSearch={openCommandPalette} />
            <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
              <PortalFooter />
            </main>
          </SidebarInset>
        </div>
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </SidebarProvider>
    </PortalContext.Provider>
  );
}
