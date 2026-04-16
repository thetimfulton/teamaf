"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  UserPlus,
  UserCog,
  UserMinus,
  Upload,
  Calendar,
  Mail,
  Megaphone,
  Activity,
} from "lucide-react";
import { getActivityLog, type ActivityEntry } from "./actions";
import type { ActivityType } from "@/types/database";

const TYPE_CONFIG: Record<
  ActivityType,
  { icon: typeof Activity; label: string; color: string }
> = {
  rsvp_submitted: {
    icon: ClipboardCheck,
    label: "RSVP Submitted",
    color: "text-green-600",
  },
  rsvp_updated: {
    icon: ClipboardCheck,
    label: "RSVP Updated",
    color: "text-blue-600",
  },
  guest_created: {
    icon: UserPlus,
    label: "Guest Added",
    color: "text-green-600",
  },
  guest_updated: {
    icon: UserCog,
    label: "Guest Updated",
    color: "text-blue-600",
  },
  guest_deleted: {
    icon: UserMinus,
    label: "Guest Deleted",
    color: "text-red-500",
  },
  guest_imported: {
    icon: Upload,
    label: "Guests Imported",
    color: "text-purple-600",
  },
  event_updated: {
    icon: Calendar,
    label: "Event Updated",
    color: "text-blue-600",
  },
  email_sent: { icon: Mail, label: "Email Sent", color: "text-green-600" },
  email_broadcast: {
    icon: Megaphone,
    label: "Email Broadcast",
    color: "text-purple-600",
  },
};

function formatDescription(entry: ActivityEntry): string {
  const details = entry.details as Record<string, unknown>;
  const name =
    entry.subjectName ?? (details.name as string) ?? (details.guestName as string) ?? "";

  switch (entry.type) {
    case "rsvp_submitted":
      return `${name} submitted RSVP (${details.accepted ?? 0} accepted, ${details.declined ?? 0} declined)`;
    case "rsvp_updated":
      return details.adminOverride
        ? `Admin overrode RSVP for ${name}`
        : `${name} updated RSVP`;
    case "guest_created":
      return `Added guest: ${name}`;
    case "guest_updated":
      return `Updated guest: ${name}`;
    case "guest_deleted":
      return `Deleted guest: ${name}`;
    case "guest_imported":
      return `Imported ${details.imported ?? 0} guests (${details.skipped ?? 0} skipped)`;
    case "event_updated":
      return `Updated event: ${name || details.action}`;
    case "email_sent":
      return `Email sent to ${name}`;
    case "email_broadcast":
      return `Broadcast "${details.subject}" to ${details.totalRecipients} recipients`;
    default:
      return entry.type;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityFeed({
  initialData,
}: {
  initialData: { entries: ActivityEntry[]; total: number };
}) {
  const [entries, setEntries] = useState(initialData.entries);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("__all__");
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (value: string | null) => {
    if (value === null) return;
    setTypeFilter(value);
    setPage(1);
    startTransition(async () => {
      const filter = value === "__all__" ? undefined : value;
      const result = await getActivityLog(1, 50, filter);
      if (result.success) {
        setEntries(result.data.entries);
        setTotal(result.data.total);
      }
    });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    startTransition(async () => {
      const filter = typeFilter === "__all__" ? undefined : typeFilter;
      const result = await getActivityLog(nextPage, 50, filter);
      if (result.success) {
        setEntries((prev) => [...prev, ...result.data.entries]);
        setPage(nextPage);
      }
    });
  };

  const hasMore = entries.length < total;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} events</p>
        <Select value={typeFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isPending ? "Loading..." : "No activity yet"}
          </div>
        ) : (
          entries.map((entry) => {
            const config = TYPE_CONFIG[entry.type] ?? {
              icon: Activity,
              label: entry.type,
              color: "text-gray-500",
            };
            const Icon = config.icon;

            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-md border bg-white p-3"
              >
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{formatDescription(entry)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(entry.created_at)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {entry.actor.replace("admin:", "").replace("guest:", "")}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={loadMore}
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
