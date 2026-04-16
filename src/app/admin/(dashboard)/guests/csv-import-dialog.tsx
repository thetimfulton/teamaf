"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { importGuests } from "./actions";
import { generateTemplateCSV, downloadCsv } from "@/lib/csv";
import { csvRowSchema } from "@/lib/validations/admin";
import type { GuestInput } from "@/lib/validations/admin";

interface ParsedRow {
  data: Record<string, string>;
  valid: boolean;
  error?: string;
  parsed?: GuestInput;
}

export function CsvImportDialog({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedRow[] = results.data.map(
          (raw: unknown) => {
            const row = raw as Record<string, string>;
            const result = csvRowSchema.safeParse(row);
            if (result.success) {
              return {
                data: row,
                valid: true,
                parsed: {
                  name: result.data.name,
                  email: result.data.email || null,
                  phone: result.data.phone || null,
                  cohort: result.data.cohort,
                  plus_one_allowed:
                    typeof result.data.plus_one_allowed === "boolean"
                      ? result.data.plus_one_allowed
                      : false,
                  plus_one_name: result.data.plus_one_name || null,
                  kids_count:
                    typeof result.data.kids_count === "number"
                      ? result.data.kids_count
                      : 0,
                  kids_names: result.data.kids_names || null,
                  dietary_notes: result.data.dietary_notes || null,
                  address: result.data.address || null,
                  notes: result.data.notes || null,
                } as GuestInput,
              };
            }
            return {
              data: row,
              valid: false,
              error: result.error.issues[0].message,
            };
          }
        );
        setRows(parsed);
      },
    });
  };

  const validRows = rows.filter((r) => r.valid && r.parsed);
  const invalidRows = rows.filter((r) => !r.valid);

  const handleImport = () => {
    startTransition(async () => {
      const toImport = validRows.map((r) => r.parsed!);
      const result = await importGuests(toImport);
      if (result.success) {
        toast.success(
          `Imported ${result.data.imported} guest${result.data.imported !== 1 ? "s" : ""}` +
            (result.data.skipped > 0 ? ` (${result.data.skipped} skipped)` : "")
        );
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDownloadTemplate = () => {
    downloadCsv(generateTemplateCSV(), "guest-import-template.csv");
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Guests from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="text-sm"
            />
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              Download template
            </Button>
          </div>

          {rows.length > 0 && (
            <>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">{validRows.length} valid</span>
                <span className="text-red-500">{invalidRows.length} invalid</span>
              </div>

              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Issue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge
                            variant={row.valid ? "default" : "destructive"}
                          >
                            {row.valid ? "OK" : "Error"}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.data.name || "—"}</TableCell>
                        <TableCell>{row.data.email || "—"}</TableCell>
                        <TableCell>{row.data.cohort || "—"}</TableCell>
                        <TableCell className="text-red-500 text-xs">
                          {row.error ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validRows.length === 0 || isPending}
                >
                  {isPending
                    ? "Importing..."
                    : `Import ${validRows.length} guest${validRows.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
