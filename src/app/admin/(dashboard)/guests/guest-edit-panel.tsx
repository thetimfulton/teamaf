"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getGuest, updateGuest, deleteGuest, overrideRsvp } from "./actions";
import type { Guest, Rsvp } from "@/types/database";
import type { GuestInput, RsvpOverrideInput } from "@/lib/validations/admin";

const COHORTS = [
  { value: "wedding_party", label: "Wedding Party" },
  { value: "immediate_family", label: "Immediate Family" },
  { value: "out_of_town", label: "Out of Town" },
  { value: "full_local", label: "Full Local" },
  { value: "ceremony_only", label: "Ceremony Only" },
];

interface Props {
  guestId: string;
  onClose: () => void;
}

export function GuestEditPanel({ guestId, onClose }: Props) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<GuestInput>({
    name: "",
    cohort: "full_local",
    plus_one_allowed: false,
    kids_count: 0,
  });

  useEffect(() => {
    getGuest(guestId).then((result) => {
      if (result.success) {
        setGuest(result.data.guest);
        setRsvps(result.data.rsvps);
        const g = result.data.guest;
        setForm({
          name: g.name,
          email: g.email,
          phone: g.phone,
          cohort: g.cohort,
          plus_one_allowed: g.plus_one_allowed,
          plus_one_name: g.plus_one_name,
          kids_count: g.kids_count,
          kids_names: g.kids_names,
          dietary_notes: g.dietary_notes,
          address: g.address,
          notes: g.notes,
        });
      }
      setLoading(false);
    });
  }, [guestId]);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateGuest(guestId, form);
      if (result.success) {
        toast.success("Guest updated");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGuest(guestId);
      if (result.success) {
        toast.success("Guest deleted");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleRsvpOverride = (
    eventId: string,
    override: RsvpOverrideInput
  ) => {
    startTransition(async () => {
      const result = await overrideRsvp(guestId, eventId, override);
      if (result.success) {
        toast.success("RSVP updated");
        // Refresh
        const refreshed = await getGuest(guestId);
        if (refreshed.success) {
          setRsvps(refreshed.data.rsvps);
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{loading ? "Loading..." : guest?.name ?? "Guest"}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Guest fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value || null })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value || null })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Cohort</Label>
                <Select
                  value={form.cohort}
                  onValueChange={(v) => {
                    if (v !== null) {
                      setForm({ ...form, cohort: v as GuestInput["cohort"] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COHORTS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="plus_one"
                  checked={form.plus_one_allowed}
                  onCheckedChange={(v) =>
                    setForm({ ...form, plus_one_allowed: !!v })
                  }
                />
                <Label htmlFor="plus_one">Plus-one allowed</Label>
              </div>

              {form.plus_one_allowed && (
                <div className="space-y-2">
                  <Label>Plus-one name</Label>
                  <Input
                    value={form.plus_one_name ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, plus_one_name: e.target.value || null })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kids count</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.kids_count}
                    onChange={(e) =>
                      setForm({ ...form, kids_count: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kids names</Label>
                  <Input
                    value={form.kids_names ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, kids_names: e.target.value || null })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dietary notes</Label>
                <Textarea
                  value={form.dietary_notes ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, dietary_notes: e.target.value || null })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Mailing address</Label>
                <Textarea
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value || null })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Internal notes</Label>
                <Textarea
                  value={form.notes ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value || null })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* RSVPs */}
            <div>
              <h3 className="font-medium mb-3">RSVP Responses</h3>
              {rsvps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No RSVPs yet</p>
              ) : (
                <div className="space-y-2">
                  {rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="text-sm">
                        <span className="font-medium">Event {rsvp.event_id.slice(0, 8)}...</span>
                        <Badge
                          variant={
                            rsvp.status === "accepted"
                              ? "default"
                              : rsvp.status === "declined"
                                ? "destructive"
                                : "secondary"
                          }
                          className="ml-2"
                        >
                          {rsvp.status}
                        </Badge>
                      </div>
                      <Select
                        value={rsvp.status}
                        onValueChange={(v) => {
                          if (v !== null) {
                            handleRsvpOverride(rsvp.event_id, {
                              status: v as RsvpOverrideInput["status"],
                              plus_one_attending: rsvp.plus_one_attending,
                              kids_attending: rsvp.kids_attending,
                              dietary_notes: rsvp.dietary_notes,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                    Delete guest
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {guest?.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the guest and all their RSVP responses.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
