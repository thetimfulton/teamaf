"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EventEditDialog } from "./event-edit-dialog";
import { getEvents, type EventWithCohorts } from "./actions";

const COHORT_LABELS: Record<string, string> = {
  wedding_party: "Wedding Party",
  immediate_family: "Family",
  out_of_town: "Out of Town",
  full_local: "Local",
  ceremony_only: "Ceremony Only",
};

export function EventList({
  initialEvents,
}: {
  initialEvents: EventWithCohorts[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const result = await getEvents();
      if (result.success) setEvents(result.data);
    });
  };

  const editingEvent = events.find((e) => e.id === editingId);

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {event.date} &middot; {event.time} &middot; {event.venue}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingId(event.id)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Address:</span>{" "}
                {event.address}
              </div>
              <div>
                <span className="text-muted-foreground">Dress code:</span>{" "}
                {event.dress_code || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Kids allowed:</span>{" "}
                {event.kids_allowed ? "Yes" : "No"}
              </div>
              {event.parking_notes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Parking:</span>{" "}
                  {event.parking_notes}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {event.cohorts.map((c) => (
                <Badge key={c} variant="secondary">
                  {COHORT_LABELS[c] ?? c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {editingEvent && (
        <EventEditDialog
          event={editingEvent}
          onClose={() => {
            setEditingId(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
