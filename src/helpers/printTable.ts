import wrapString from "./wrapString.ts";

/** A value that can be stored in a table cell. */
type CellValue = string | number | boolean | Date | null;

/**
 * Prints a formatted table to the console with support for word wrapping within cells.
 * Unlike console.table(), this function properly handles multi-line content within cells,
 * making it ideal for displaying data with long text values.
 *
 * @param data - An array of objects representing the rows of the table. Each object should have string keys.
 * @param options - Optional configuration for table rendering.
 * @param options.maxColumnWidth - The maximum width for any column (default: 75). Values exceeding this width will be wrapped at word boundaries.
 * @param options.minColumnWidth - The minimum width for any column (default: 3).
 * @param options.typesRowIndex - The index of a row that contains type annotations (e.g. "VARCHAR/string"). This row will be rendered in grey. If omitted, no row is treated as a types row.
 * @returns void - The table is printed directly to the console.
 *
 * @example
 * ```typescript
 * const data = [
 *   { name: "Alice", description: "A software engineer with expertise in TypeScript" },
 *   { name: "Bob", description: "A product manager" }
 * ];
 * printTable(data, { maxColumnWidth: 30 });
 * // Outputs a nicely formatted table with word-wrapped description column
 * ```
 *
 * @example
 * ```typescript
 * // With types row
 * const types = { name: "VARCHAR/string", age: "INTEGER/number" };
 * const data = [
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 }
 * ];
 * printTable([types, ...data], { typesRowIndex: 0 });
 * ```
 */
export default function printTable(
  data: { [key: string]: CellValue }[],
  options?: {
    maxColumnWidth?: number;
    minColumnWidth?: number;
    typesRowIndex?: number;
  },
): void {
  if (!data || data.length === 0) {
    console.log("(empty table)");
    return;
  }

  const maxColumnWidth = options?.maxColumnWidth ?? 75;
  const minColumnWidth = options?.minColumnWidth ?? 3;

  // Helper function to format values for display
  const formatValue = (value: CellValue): string => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return String(value);
  };

  // Get all column names
  const columns = Object.keys(data[0]);

  if (columns.length === 0) {
    console.log("(empty table)");
    return;
  }

  // Single pass: calculate column widths and prepare wrapped data.
  // First, seed widths from header names.
  const columnWidths: { [key: string]: number } = {};
  for (const col of columns) {
    columnWidths[col] = col.length;
  }

  // Format every cell, track the longest raw line per column, and
  // store the formatted strings for the wrapping step that follows.
  const formattedData: string[][] = [];
  for (const row of data) {
    const formattedRow: string[] = [];
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const value = formatValue(row[col]);
      formattedRow.push(value);

      // Track longest line (handles embedded newlines)
      const lines = value.split("\n");
      let longestLine = 0;
      for (const line of lines) {
        if (line.length > longestLine) longestLine = line.length;
      }
      if (longestLine > columnWidths[col]) {
        columnWidths[col] = longestLine;
      }
    }
    formattedData.push(formattedRow);
  }

  // Apply min/max constraints
  for (const col of columns) {
    columnWidths[col] = Math.min(
      Math.max(columnWidths[col], minColumnWidth),
      maxColumnWidth,
    );
  }

  // Wrap pre-formatted strings into multi-line cells
  const wrappedData: { [key: string]: string[] }[] = [];

  for (let r = 0; r < formattedData.length; r++) {
    const wrappedRow: { [key: string]: string[] } = {};

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const value = formattedData[r][c];
      const width = columnWidths[col];

      // Split by existing newlines, then wrap each part
      const lines = value.split("\n");
      const allWrappedLines: string[] = [];

      for (const line of lines) {
        if (line.length <= width) {
          allWrappedLines.push(line);
        } else {
          // Wrap long lines at word boundaries
          const wrapped = wrapString(line, width);
          allWrappedLines.push(...wrapped.split("\n"));
        }
      }

      wrappedRow[col] = allWrappedLines.length > 0 ? allWrappedLines : [""];
    }

    wrappedData.push(wrappedRow);
  }

  // ANSI color codes (matching Deno's console colors)
  const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    grey: "\x1b[90m",
    string: "\x1b[32m", // green
    number: "\x1b[33m", // yellow
    boolean: "\x1b[95m", // bright magenta/pink
    date: "\x1b[36m", // cyan
    null: "\x1b[90m", // grey
  };

  // Helper function to get color for a value based on its actual JavaScript type
  const getColorForValue = (
    value: CellValue,
    isTypeRow: boolean,
  ): string => {
    if (isTypeRow) return colors.grey;
    if (value === null || value === undefined) return colors.null;
    if (value instanceof Date) return colors.date;
    if (typeof value === "boolean") return colors.boolean;
    if (typeof value === "number") return colors.number;
    return colors.string;
  };

  // Helper function to create a horizontal border line with column junctions
  const createBorderLine = (
    left: string,
    middle: string,
    right: string,
  ) => {
    const segments = columns.map((col) => "─".repeat(columnWidths[col] + 2));
    return colors.grey + left + segments.join(middle) + right + colors.reset;
  };

  // Helper function to create a separator line
  const createSeparator = () => createBorderLine("├", "┼", "┤");

  // Helper function to create the top border
  const createTopBorder = () => createBorderLine("┌", "┬", "┐");

  // Helper function to create the bottom border
  const createBottomBorder = () => createBorderLine("└", "┴", "┘");

  // Helper function to pad a string to a specific width
  const pad = (str: string, width: number) => {
    return str + " ".repeat(Math.max(0, width - str.length));
  };

  // Print top border
  console.log(createTopBorder());

  // Print header row (bold)
  const headerParts = columns.map((col) =>
    ` ${colors.bold}${pad(col, columnWidths[col])}${colors.reset} `
  );
  console.log(
    colors.grey + "│" + colors.reset +
      headerParts.join(colors.grey + "│" + colors.reset) + colors.grey + "│" +
      colors.reset,
  );

  // Print separator after header (unless the first row is the types row,
  // in which case the separator is printed after the types row instead)
  if (options?.typesRowIndex !== 0) {
    console.log(createSeparator());
  }

  // Print data rows
  for (let i = 0; i < wrappedData.length; i++) {
    const wrappedRow = wrappedData[i];
    const originalRow = data[i];
    const isTypeRow = i === options?.typesRowIndex;

    // Find the maximum number of lines in this row
    let maxLines = 1;
    for (const col of columns) {
      if (wrappedRow[col].length > maxLines) {
        maxLines = wrappedRow[col].length;
      }
    }

    // Print each line of this row
    for (let lineIdx = 0; lineIdx < maxLines; lineIdx++) {
      const lineParts = columns.map((col) => {
        const lines = wrappedRow[col];
        const lineValue = lineIdx < lines.length ? lines[lineIdx] : "";
        const color = getColorForValue(originalRow[col], isTypeRow);
        return ` ${color}${pad(lineValue, columnWidths[col])}${colors.reset} `;
      });
      console.log(
        colors.grey + "│" + colors.reset +
          lineParts.join(colors.grey + "│" + colors.reset) + colors.grey +
          "│" +
          colors.reset,
      );
    }

    // Print separator after types row
    if (isTypeRow) {
      console.log(createSeparator());
    }
  }

  // Print bottom border
  console.log(createBottomBorder());
}
