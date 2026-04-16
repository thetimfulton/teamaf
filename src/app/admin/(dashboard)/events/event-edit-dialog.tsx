"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  updateEvent,
  updateEventCohorts,
  getAffectedGuestCount,
  notifyAffectedGuests,
  type EventWithCohorts,
} from "./actions";
import type { Cohort } from "@/types/database";
import type { EventUpdateInput } from "@/lib/validations/admin";

const ALL_COHORTS: { value: Cohort; label: string }[] = [
  { value: "wedding_party", label: "Wedding Party" },
  { value: "immediate_family", label: "Immediate Family" },
  { value: "out_of_town", label: "Out of Town" },
  { value: "full_local", label: "Full Local" },
  { value: "ceremony_only", label: "Ceremony Only" },
];

export function EventEditDialog({
  event,
  onClose,
}: {
  event: EventWithCohorts;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [affectedCount, setAffectedCount] = useState<number | null>(null);

  const [form, setForm] = useState<EventUpdateInput>({
    name: event.name,
    date: event.date,
    time: event.time,
    venue: event.venue,
    address: event.address,
    description: event.description,
    dress_code: event.dress_code,
    parking_notes: event.parking_notes,
    kids_allowed: event.kids_allowed,
    sort_order: event.sort_order,
    map_url: null,
  });

  const [cohorts, setCohorts] = useState<Cohort[]>(event.cohorts);

  useEffect(() => {
    getAffectedGuestCount(event.id).then((r) => {
      if (r.success) setAffectedCount(r.data);
    });
  }, [event.id]);

  const toggleCohort = (cohort: Cohort) => {
    setCohorts((prev) =>
      prev.includes(cohort) ? prev.filter((c) => c !== cohort) : [...prev, cohort]
    );
  };

  const handleSave = (notify: boolean) => {
    startTransition(async () => {
      const eventResult = await updateEvent(event.id, form);
      if (!eventResult.success) {
        toast.error(eventResult.error);
        return;
      }

      const cohortsResult = await updateEventCohorts(event.id, cohorts);
      if (!cohortsResult.success) {
        toast.error(cohortsResult.error);
        return;
      }

      if (notify && affectedCount && affectedCount > 0) {
        await notifyAffectedGuests(event.id);
        toast.success(`Saved and notified ${affectedCount} guest(s)`);
      } else {
        toast.success("Event updated");
      }

      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit: {event.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Venue</Label>
            <Input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value || null })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dress code</Label>
              <Input
                value={form.dress_code ?? ""}
                onChange={(e) =>
                  setForm({ ...form, dress_code: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Parking notes</Label>
            <Textarea
              value={form.parking_notes ?? ""}
              onChange={(e) =>
                setForm({ ...form, parking_notes: e.target.value || null })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="kids_allowed"
              checked={form.kids_allowed}
              onCheckedChange={(v) => setForm({ ...form, kids_allowed: !!v })}
            />
            <Label htmlFor="kids_allowed">Kids allowed</Label>
          </div>

          <Separator />

          <div>
            <Label className="mb-2 block">Invited Cohorts</Label>
            <div className="space-y-2">
              {ALL_COHORTS.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`cohort-${value}`}
                    checked={cohorts.includes(value)}
                    onCheckedChange={() => toggleCohort(value)}
                  />
                  <Label htmlFor={`cohort-${value}`}>{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {affectedCount !== null
                ? `${affectedCount} guest(s) have accepted this event`
                : "Loading..."}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isPending}
            >
              Save only
            </Button>
            {affectedCount !== null && affectedCount > 0 && (
              <Button onClick={() => handleSave(true)} disabled={isPending}>
                {isPending ? "Saving..." : "Save & Notify Guests"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
