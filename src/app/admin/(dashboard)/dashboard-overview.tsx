"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardCheck,
  Clock,
  TrendingUp,
  Plus,
  Mail,
  Download,
  Activity,
} from "lucide-react";
import type { RsvpOverview, EventBreakdown } from "./rsvps/actions";
import type { ActivityEntry } from "./activity/actions";
import type { ActivityType } from "@/types/database";

const TYPE_LABELS: Record<ActivityType, string> = {
  rsvp_submitted: "RSVP",
  rsvp_updated: "RSVP Update",
  guest_created: "Guest Added",
  guest_updated: "Guest Edit",
  guest_deleted: "Guest Removed",
  guest_imported: "Import",
  event_updated: "Event Update",
  email_sent: "Email",
  email_broadcast: "Broadcast",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DashboardOverview({
  overview,
  breakdown,
  recentActivity,
}: {
  overview: RsvpOverview | null;
  breakdown: EventBreakdown[];
  recentActivity: ActivityEntry[];
}) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Guests
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalGuests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                RSVPs In
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalRsvps}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.pendingGuests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accept Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.acceptRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Event breakdown mini */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Event Headcount</CardTitle>
            <Link href="/admin/rsvps">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.map((row) => (
                <div key={row.eventId} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{row.eventName}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {row.eventDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600">{row.attending}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{row.totalHeadcount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Link href="/admin/activity">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </Badge>
                      <span className="text-muted-foreground truncate max-w-[200px]">
                        {entry.subjectName ??
                          (String((entry.details as Record<string, unknown>).name ?? "") ||
                          String((entry.details as Record<string, unknown>).guestName ?? "") ||
                          "")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(entry.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/guests">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Guest
              </Button>
            </Link>
            <Link href="/admin/email">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-1" />
                Send Email
              </Button>
            </Link>
            <Link href="/admin/rsvps">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export RSVPs
              </Button>
            </Link>
            <Link href="/admin/activity">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-1" />
                Activity Log
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
