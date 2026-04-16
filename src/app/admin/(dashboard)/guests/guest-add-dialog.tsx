"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createGuest } from "./actions";
import type { GuestInput } from "@/lib/validations/admin";

const COHORTS = [
  { value: "wedding_party", label: "Wedding Party" },
  { value: "immediate_family", label: "Immediate Family" },
  { value: "out_of_town", label: "Out of Town" },
  { value: "full_local", label: "Full Local" },
  { value: "ceremony_only", label: "Ceremony Only" },
];

export function GuestAddDialog({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<GuestInput>({
    name: "",
    cohort: "full_local",
    plus_one_allowed: false,
    kids_count: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createGuest(form);
      if (result.success) {
        toast.success("Guest added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Guest</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
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
            <Label>Cohort *</Label>
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
              id="add_plus_one"
              checked={form.plus_one_allowed}
              onCheckedChange={(v) =>
                setForm({ ...form, plus_one_allowed: !!v })
              }
            />
            <Label htmlFor="add_plus_one">Plus-one allowed</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
