import wrapString from "./wrapString.ts";

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
  data: { [key: string]: string | number | boolean | Date | null }[],
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
  const formatValue = (
    value: string | number | boolean | Date | null,
  ): string => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return String(value);
  };

  // Get all column names
  const columns = Object.keys(data[0]);

  // Calculate the required width for each column
  const columnWidths: { [key: string]: number } = {};

  for (const col of columns) {
    let maxWidth = col.length;

    for (const row of data) {
      const value = formatValue(row[col]);
      // For wrapped strings, consider the longest line
      const lines = value.split("\n");
      const longestLine = Math.max(...lines.map((line) => line.length));
      maxWidth = Math.max(maxWidth, longestLine);
    }

    // Apply min/max constraints
    columnWidths[col] = Math.min(
      Math.max(maxWidth, minColumnWidth),
      maxColumnWidth,
    );
  }

  // Prepare wrapped data where each cell can contain multiple lines
  const wrappedData: { [key: string]: string[] }[] = [];

  for (const row of data) {
    const wrappedRow: { [key: string]: string[] } = {};

    for (const col of columns) {
      const value = formatValue(row[col]);
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
    value: string | number | boolean | Date | null,
    isTypeRow: boolean = false,
  ): string => {
    if (isTypeRow) return colors.grey;
    if (value === null || value === undefined) return colors.null;
    if (value instanceof Date) return colors.date;
    if (typeof value === "boolean") return colors.boolean;
    if (typeof value === "number") return colors.number;
    return colors.string;
  };

  // Helper function to create a separator line
  const createSeparator = () => {
    const parts = columns.map((col) => "─".repeat(columnWidths[col] + 2));
    return colors.grey + "├" + parts.join("┼") + "┤" + colors.reset;
  };

  // Helper function to create the top border
  const createTopBorder = () => {
    const parts = columns.map((col) => "─".repeat(columnWidths[col] + 2));
    return colors.grey + "┌" + parts.join("┬") + "┐" + colors.reset;
  };

  // Helper function to create the bottom border
  const createBottomBorder = () => {
    const parts = columns.map((col) => "─".repeat(columnWidths[col] + 2));
    return colors.grey + "└" + parts.join("┴") + "┘" + colors.reset;
  };

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

  // Print separator after header
  console.log(createSeparator());

  // Print data rows
  for (let i = 0; i < wrappedData.length; i++) {
    const wrappedRow = wrappedData[i];
    const originalRow = data[i];
    const isTypeRow = i === options?.typesRowIndex;

    // Find the maximum number of lines in this row
    const maxLines = Math.max(
      ...columns.map((col) => wrappedRow[col].length),
    );

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
          lineParts.join(colors.grey + "│" + colors.reset) + colors.grey + "│" +
          colors.reset,
      );
    }

    // Print separator between rows (except after the last row)
    if (i < wrappedData.length - 1) {
      console.log(createSeparator());
    }
  }

  // Print bottom border
  console.log(createBottomBorder());
}
