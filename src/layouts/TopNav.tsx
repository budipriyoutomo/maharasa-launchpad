import { Link } from "@tanstack/react-router";
import { Command, LogOut, Moon, Search, Settings, Sun, User } from "lucide-react";

import { MaharasaLogo } from "@/components/MaharasaLogo";
import { NotificationMenu } from "@/components/NotificationMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";

interface TopNavProps {
  onOpenSearch: () => void;
}

export function TopNav({ onOpenSearch }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <SidebarTrigger className="shrink-0" />

      {/* Branding also lives in the sidebar, but that collapses to icons and
          becomes a sheet on mobile — the header is the one constant. */}
      <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Maharasa Portal home">
        <MaharasaLogo className="size-8" />
        <span className="hidden text-sm font-semibold tracking-tight md:inline">
          Maharasa Portal
        </span>
      </Link>

      <span aria-hidden className="hidden h-6 w-px shrink-0 bg-border sm:block" />

      <button
        type="button"
        onClick={onOpenSearch}
        className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search applications...</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          CTRL K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Open command palette"
          onClick={onOpenSearch}
        >
          <Command className="size-4" />
        </Button>

        <NotificationMenu />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-hidden ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  MG
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="flex flex-col">
              <span>Maharasa Employee</span>
              <span className="text-xs font-normal text-muted-foreground">
                employee@maharasa.id
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
