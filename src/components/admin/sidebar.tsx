"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  UtensilsCrossed,
  Mail,
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/login/actions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/guests", label: "Guests", icon: Users },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/rsvps", label: "RSVPs", icon: ClipboardCheck },
  { href: "/admin/dietary", label: "Dietary", icon: UtensilsCrossed },
  { href: "/admin/email", label: "Email", icon: Mail },
  { href: "/admin/activity", label: "Activity", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="text-lg font-semibold">
          #teamAF
        </Link>
        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
