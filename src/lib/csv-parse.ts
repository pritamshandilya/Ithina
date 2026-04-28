/**
 * Minimal CSV parse/serialize for in-browser edits before re-upload.
 * Handles quoted fields and doubled quotes; uses UTF-8 (BOM optional on serialize).
 */

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function splitLines(text: string): string[] {
  return text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.length > 0);
}

/**
 * Parse full file text into row objects keyed by `canonicalHeaders` (column order from API).
 * Each data line must have the same number of cells as headers; missing cells become "".
 */
export function parseCsvTextToKeyedRows(
  text: string,
  canonicalHeaders: string[],
): Record<string, string>[] {
  const lines = splitLines(text);
  if (lines.length < 2 || canonicalHeaders.length === 0) return [];

  const headerCells = parseCsvLine(lines[0]);
  if (headerCells.length !== canonicalHeaders.length) {
    throw new Error(
      `CSV has ${headerCells.length} columns but expected ${canonicalHeaders.length}. Re-export the file with matching columns.`,
    );
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    canonicalHeaders.forEach((h, j) => {
      row[h] = (cells[j] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function escapeField(val: string): string {
  if (/[",\n\r]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** Build CSV text (no BOM — caller may prepend FEFF for Excel). */
export function serializeCsv(headers: string[], rows: Record<string, string>[]): string {
  const head = headers.map(escapeField).join(",");
  const body = rows
    .map((row) => headers.map((h) => escapeField(row[h] ?? "")).join(","))
    .join("\n");
  return `${head}\n${body}`;
}
