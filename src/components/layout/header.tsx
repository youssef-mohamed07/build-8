"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { CurrencyCode } from "@/lib/currency";
import { CommandSearch } from "@/components/layout/command-search";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { UserMenu } from "@/components/layout/user-menu";

interface HeaderProps {
  title: string;
  description?: string;
  authSkipped?: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  notifications?: { id: string; title: string; message: string; link: string | null; read: boolean; createdAt: Date }[];
  unreadCount?: number;
  currency?: CurrencyCode;
}

export function Header({
  title,
  description,
  authSkipped,
  user,
  notifications = [],
  unreadCount = 0,
  currency = "USD",
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { collapsed } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className={collapsed ? "ml-0" : ""}>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {authSkipped && (
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              Auth skipped
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        <CommandSearch />
        <CurrencySwitcher initialCurrency={currency} />
        <NotificationDropdown notifications={notifications} unreadCount={unreadCount} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
