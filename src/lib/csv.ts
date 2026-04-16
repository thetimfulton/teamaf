export const GUEST_CSV_HEADERS = [
  "name",
  "email",
  "phone",
  "cohort",
  "plus_one_allowed",
  "plus_one_name",
  "kids_count",
  "kids_names",
  "dietary_notes",
  "address",
  "notes",
];

export function generateCsvString(
  data: Record<string, unknown>[],
  headers: string[]
): string {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = data.map((row) =>
    headers.map((h) => escape(row[h])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function generateTemplateCSV(): string {
  return GUEST_CSV_HEADERS.join(",") + "\nJane Doe,jane@example.com,,full_local,false,,0,,,," ;
}
