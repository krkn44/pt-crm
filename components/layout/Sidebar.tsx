"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell,
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Users,
  ClipboardList,
  Bell,
  BarChart3,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: "CLIENT" | "TRAINER";
  userName: string;
}

const clientNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Allenamento",
    href: "/client/workout",
    icon: Dumbbell,
  },
  {
    title: "Progressi",
    href: "/client/progress",
    icon: TrendingUp,
  },
  {
    title: "Appuntamenti",
    href: "/client/appointments",
    icon: Calendar,
  },
];

const trainerNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/trainer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clienti",
    href: "/trainer/clients",
    icon: Users,
  },
  {
    title: "Schede",
    href: "/trainer/workouts",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/trainer/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifiche",
    href: "/trainer/notifications",
    icon: Bell,
  },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "CLIENT" ? clientNavItems : trainerNavItems;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PT CRM</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <div className="px-3 py-2">
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            {role === "CLIENT" ? "AREA CLIENTE" : "AREA TRAINER"}
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="mb-2 px-3 text-sm font-medium">
          {userName}
        </div>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Esci
        </Button>
      </div>
    </div>
  );
}
