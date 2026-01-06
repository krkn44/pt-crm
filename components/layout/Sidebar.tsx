"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  Dumbbell,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Users,
  ClipboardList,
  Bell,
  BarChart3,
  Menu,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: "CLIENT" | "TRAINER";
}

const clientNavItems: NavItem[] = [
  {
    title: "Workout",
    href: "/client/workout",
    icon: Dumbbell,
  },
  {
    title: "Progress",
    href: "/client/progress",
    icon: TrendingUp,
  },
  {
    title: "Diary",
    href: "/client/diary",
    icon: BookOpen,
  },
];

const trainerNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/trainer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/trainer/clients",
    icon: Users,
  },
  {
    title: "Workouts",
    href: "/trainer/workouts",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/trainer/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    href: "/trainer/notifications",
    icon: Bell,
  },
];

function SidebarContent({ role, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navItems = role === "CLIENT" ? clientNavItems : trainerNavItems;

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PT CRM</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <div className="px-3 py-2">
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            {role === "CLIENT" ? "CLIENT AREA" : "TRAINER AREA"}
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
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
    </>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PT CRM</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex h-full flex-col">
              <SidebarContent role={role} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col border-r bg-card">
        <SidebarContent role={role} />
      </div>
    </>
  );
}
