"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Users, ClipboardCheck, Clock, TrendingUp } from "lucide-react";
import {
  getEventBreakdown,
  exportRsvpsCsv,
  type RsvpOverview,
  type EventBreakdown,
} from "./actions";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";
import type { Cohort } from "@/types/database";

const COHORT_OPTIONS = [
  { value: "__all__", label: "All cohorts" },
  { value: "wedding_party", label: "Wedding Party" },
  { value: "immediate_family", label: "Family" },
  { value: "out_of_town", label: "Out of Town" },
  { value: "full_local", label: "Local" },
  { value: "ceremony_only", label: "Ceremony Only" },
];

export function RsvpDashboard({
  initialOverview,
  initialBreakdown,
}: {
  initialOverview: RsvpOverview | null;
  initialBreakdown: EventBreakdown[];
}) {
  const [overview] = useState(initialOverview);
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [cohortFilter, setCohortFilter] = useState<string>("__all__");
  const [isPending, startTransition] = useTransition();

  const handleCohortChange = (value: string | null) => {
    if (value === null) return;
    setCohortFilter(value);
    startTransition(async () => {
      const filter = value === "__all__" ? undefined : (value as Cohort);
      const result = await getEventBreakdown(filter);
      if (result.success) setBreakdown(result.data);
    });
  };

  const handleExport = async () => {
    const filter =
      cohortFilter === "__all__" ? undefined : (cohortFilter as Cohort);
    const result = await exportRsvpsCsv(filter);
    if (result.success) {
      downloadCsv(result.data, `rsvps-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("CSV exported");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
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
                RSVPs Received
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

      {/* Breakdown table */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Per-Event Breakdown</h2>
        <div className="flex gap-2">
          <Select value={cohortFilter} onValueChange={handleCohortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COHORT_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className="text-center">Attending</TableHead>
              <TableHead className="text-center">Declined</TableHead>
              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Plus-ones</TableHead>
              <TableHead className="text-center">Kids</TableHead>
              <TableHead className="text-center font-semibold">
                Total Headcount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.map((row) => (
              <TableRow key={row.eventId}>
                <TableCell>
                  <div className="font-medium">{row.eventName}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.eventDate}
                  </div>
                </TableCell>
                <TableCell className="text-center text-green-600">
                  {row.attending}
                </TableCell>
                <TableCell className="text-center text-red-500">
                  {row.declined}
                </TableCell>
                <TableCell className="text-center text-amber-500">
                  {row.pending}
                </TableCell>
                <TableCell className="text-center">{row.plusOnes}</TableCell>
                <TableCell className="text-center">{row.kids}</TableCell>
                <TableCell className="text-center font-semibold">
                  {row.totalHeadcount}
                </TableCell>
              </TableRow>
            ))}
            {isPending && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
