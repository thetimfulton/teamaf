"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Download, Upload, ChevronUp, ChevronDown } from "lucide-react";
import { getGuests, exportGuestsCsv, type GuestWithRsvpSummary } from "./actions";
import { GuestEditPanel } from "./guest-edit-panel";
import { GuestAddDialog } from "./guest-add-dialog";
import { CsvImportDialog } from "./csv-import-dialog";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";
import type { GuestFilter } from "@/lib/validations/admin";

const COHORT_LABELS: Record<string, string> = {
  wedding_party: "Wedding Party",
  immediate_family: "Family",
  out_of_town: "Out of Town",
  full_local: "Local",
  ceremony_only: "Ceremony Only",
};

interface Props {
  initialData: { guests: GuestWithRsvpSummary[]; total: number };
}

export function GuestTable({ initialData }: Props) {
  const [guests, setGuests] = useState(initialData.guests);
  const [total, setTotal] = useState(initialData.total);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Partial<GuestFilter>>({
    search: "",
    cohort: undefined,
    rsvpStatus: undefined,
    sortField: "name",
    sortDir: "asc",
    page: 1,
    perPage: 50,
  });

  const refresh = useCallback(
    (overrides?: Partial<GuestFilter>) => {
      const merged = { ...filters, ...overrides };
      startTransition(async () => {
        const result = await getGuests(merged);
        if (result.success) {
          setGuests(result.data.guests);
          setTotal(result.data.total);
        }
      });
      setFilters(merged);
    },
    [filters]
  );

  const handleSort = (field: "name" | "cohort" | "created_at") => {
    const newDir =
      filters.sortField === field && filters.sortDir === "asc" ? "desc" : "asc";
    refresh({ sortField: field, sortDir: newDir, page: 1 });
  };

  const handleExport = async () => {
    const result = await exportGuestsCsv();
    if (result.success) {
      downloadCsv(result.data, `guests-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("CSV exported");
    } else {
      toast.error(result.error);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortField !== field) return null;
    return filters.sortDir === "asc" ? (
      <ChevronUp className="inline h-3 w-3" />
    ) : (
      <ChevronDown className="inline h-3 w-3" />
    );
  };

  const totalPages = Math.ceil(total / (filters.perPage ?? 50));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-9"
            value={filters.search ?? ""}
            onChange={(e) => {
              const search = e.target.value;
              setFilters((f) => ({ ...f, search }));
              // Debounce
              const t = setTimeout(() => refresh({ search, page: 1 }), 300);
              return () => clearTimeout(t);
            }}
          />
        </div>

        <Select
          value={filters.cohort ?? "__all__"}
          onValueChange={(v) => {
            if (v !== null) {
              refresh({
                cohort: v === "__all__" ? undefined : (v as GuestFilter["cohort"]),
                page: 1,
              });
            }
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All cohorts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All cohorts</SelectItem>
            {Object.entries(COHORT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.rsvpStatus ?? "all"}
          onValueChange={(v) => {
            if (v !== null) {
              refresh({ rsvpStatus: v as GuestFilter["rsvpStatus"], page: 1 });
            }
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="RSVP status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="has_accepted">Has accepted</SelectItem>
            <SelectItem value="has_declined">Has declined</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="no_rsvp">No RSVP</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                Name <SortIcon field="name" />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("cohort")}
              >
                Cohort <SortIcon field="cohort" />
              </TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Plus One</TableHead>
              <TableHead>Kids</TableHead>
              <TableHead>Dietary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {isPending ? "Loading..." : "No guests found"}
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow
                  key={guest.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedGuest(guest.id)}
                >
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.email || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {COHORT_LABELS[guest.cohort] ?? guest.cohort}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest.rsvp_summary.total === 0 ? (
                      <span className="text-muted-foreground text-sm">No RSVP</span>
                    ) : (
                      <span className="text-sm">
                        <span className="text-green-600">{guest.rsvp_summary.accepted}Y</span>
                        {" / "}
                        <span className="text-red-500">{guest.rsvp_summary.declined}N</span>
                        {guest.rsvp_summary.pending > 0 && (
                          <>
                            {" / "}
                            <span className="text-amber-500">{guest.rsvp_summary.pending}?</span>
                          </>
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.plus_one_allowed
                      ? guest.plus_one_name || "Yes"
                      : "—"}
                  </TableCell>
                  <TableCell>{guest.kids_count || "—"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {guest.dietary_notes || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} guest{total !== 1 && "s"} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => refresh({ page: (filters.page ?? 1) - 1 })}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm">
              Page {filters.page ?? 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => refresh({ page: (filters.page ?? 1) + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {selectedGuest && (
        <GuestEditPanel
          guestId={selectedGuest}
          onClose={() => {
            setSelectedGuest(null);
            refresh();
          }}
        />
      )}
      {showAdd && (
        <GuestAddDialog
          onClose={() => {
            setShowAdd(false);
            refresh();
          }}
        />
      )}
      {showImport && (
        <CsvImportDialog
          onClose={() => {
            setShowImport(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
