"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Send, Eye, Users } from "lucide-react";
import { toast } from "sonner";
import {
  getRecipientCount,
  getRecipientList,
  sendBroadcast,
} from "./actions";
import type { Cohort } from "@/types/database";

const ALL_COHORTS: { value: Cohort; label: string }[] = [
  { value: "wedding_party", label: "Wedding Party" },
  { value: "immediate_family", label: "Immediate Family" },
  { value: "out_of_town", label: "Out of Town" },
  { value: "full_local", label: "Full Local" },
  { value: "ceremony_only", label: "Ceremony Only" },
];

const RSVP_FILTERS = [
  { value: "all", label: "All guests" },
  { value: "has_rsvp", label: "Has RSVP'd" },
  { value: "no_rsvp", label: "Hasn't RSVP'd" },
  { value: "accepted", label: "Accepted any event" },
  { value: "declined", label: "Declined any event" },
];

export function EmailComposer() {
  const [selectedCohorts, setSelectedCohorts] = useState<Cohort[]>([]);
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewRecipients, setPreviewRecipients] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isPending, startTransition] = useTransition();

  const updateCount = useCallback(() => {
    if (selectedCohorts.length === 0) {
      setRecipientCount(0);
      return;
    }
    getRecipientCount(selectedCohorts, rsvpFilter).then((r) => {
      if (r.success) setRecipientCount(r.data);
    });
  }, [selectedCohorts, rsvpFilter]);

  useEffect(() => {
    updateCount();
  }, [updateCount]);

  const toggleCohort = (cohort: Cohort) => {
    setSelectedCohorts((prev) =>
      prev.includes(cohort)
        ? prev.filter((c) => c !== cohort)
        : [...prev, cohort]
    );
  };

  const handlePreview = async () => {
    const result = await getRecipientList(selectedCohorts, rsvpFilter);
    if (result.success) {
      setPreviewRecipients(result.data);
      setShowPreview(true);
    }
  };

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendBroadcast({
        subject,
        body,
        cohorts: selectedCohorts,
        rsvpFilter: rsvpFilter as "all" | "has_rsvp" | "no_rsvp" | "accepted" | "declined",
      });

      if (result.success) {
        toast.success(
          `Sent to ${result.data.sent} recipient(s)` +
            (result.data.failed > 0 ? ` (${result.data.failed} failed)` : "")
        );
        setSubject("");
        setBody("");
      } else {
        toast.error(result.error);
      }
    });
  };

  const canSend =
    selectedCohorts.length > 0 &&
    subject.trim() &&
    body.trim() &&
    (recipientCount ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Cohorts</Label>
            <div className="space-y-2">
              {ALL_COHORTS.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`email-cohort-${value}`}
                    checked={selectedCohorts.includes(value)}
                    onCheckedChange={() => toggleCohort(value)}
                  />
                  <Label htmlFor={`email-cohort-${value}`}>{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>RSVP Status</Label>
            <Select value={rsvpFilter} onValueChange={(v) => { if (v !== null) setRsvpFilter(v); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RSVP_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>
                {recipientCount !== null
                  ? `${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`
                  : "Calculating..."}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={selectedCohorts.length === 0}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., An update about the wedding weekend"
            />
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here. Use {{guestName}} for personalization."
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Available variables: {"{{guestName}}"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Send */}
      <AlertDialog>
        <AlertDialogTrigger render={<Button disabled={!canSend || isPending} className="w-full" />}>
            <Send className="h-4 w-4 mr-2" />
            {isPending
              ? "Sending..."
              : `Send to ${recipientCount ?? 0} recipient${(recipientCount ?? 0) !== 1 ? "s" : ""}`}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send email broadcast?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send &quot;{subject}&quot; to {recipientCount} recipient
              {(recipientCount ?? 0) !== 1 ? "s" : ""}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Recipients ({previewRecipients.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {previewRecipients.map((r) => (
              <div
                key={r.id}
                className="flex justify-between text-sm py-1 border-b last:border-0"
              >
                <span>{r.name}</span>
                <span className="text-muted-foreground">{r.email}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
