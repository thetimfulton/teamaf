"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, ChevronDown, ChevronRight } from "lucide-react";
import { exportDietaryCsv, type DietaryCategory } from "./actions";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export function DietaryReport({
  initialCategories,
}: {
  initialCategories: DietaryCategory[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const totalEntries = initialCategories.reduce(
    (sum, c) => sum + c.entries.length,
    0
  );

  const handleExport = async () => {
    const result = await exportDietaryCsv();
    if (result.success) {
      downloadCsv(result.data, `dietary-report-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("CSV exported");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalEntries} dietary note{totalEntries !== 1 ? "s" : ""} across{" "}
          {initialCategories.length} categor
          {initialCategories.length !== 1 ? "ies" : "y"}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {initialCategories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No dietary notes recorded yet
          </CardContent>
        </Card>
      ) : (
        initialCategories.map((category) => (
          <Card key={category.label}>
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between py-4"
              onClick={() => toggle(category.label)}
            >
              <div className="flex items-center gap-3">
                {expanded.has(category.label) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <CardTitle className="text-base">{category.label}</CardTitle>
                <Badge variant="secondary">{category.entries.length}</Badge>
              </div>
            </CardHeader>

            {expanded.has(category.label) && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.entries.map((entry, i) => (
                    <div
                      key={`${entry.guestId}-${i}`}
                      className="flex items-start justify-between rounded-md border p-3 text-sm"
                    >
                      <div>
                        <span className="font-medium">{entry.guestName}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {entry.note}
                        </p>
                      </div>
                      {entry.eventName && (
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {entry.eventName}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
