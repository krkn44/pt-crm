"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName: string;
  title: string;
}

export function Header({ userName, title }: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
