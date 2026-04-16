"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./sidebar";

const titleMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/guests": "Guest Management",
  "/admin/events": "Event Management",
  "/admin/rsvps": "RSVP Dashboard",
  "/admin/dietary": "Dietary Report",
  "/admin/email": "Email Broadcast",
  "/admin/activity": "Activity Log",
};

function getTitle(pathname: string): string {
  for (const [path, title] of Object.entries(titleMap)) {
    if (path === "/admin" ? pathname === "/admin" : pathname.startsWith(path)) {
      return title;
    }
  }
  return "Admin";
}

export function AdminHeader({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger render={<button className="md:hidden p-2 -ml-2" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-semibold">{getTitle(pathname)}</h1>

      <div className="ml-auto flex items-center gap-4">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          {email}
        </span>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View site
        </Link>
      </div>
    </header>
  );
}
