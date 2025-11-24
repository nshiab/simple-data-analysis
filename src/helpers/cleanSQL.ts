export default function cleanSQL(query: string) {
  // First pass
  let cleaned = query
    .replace(/ && /g, " AND ")
    .replace(/ === /g, " = ")
    .replace(/ == /g, " = ")
    .replace(/ !== /g, " != ");

  // Replace || with OR only in WHERE clauses (for logical operations)
  // Preserve || elsewhere as it's the SQL concatenation operator
  cleaned = cleaned.replace(
    /WHERE\s+([\s\S]*?)(?=\s+(?:GROUP BY|ORDER BY|LIMIT|HAVING)|$)/gi,
    (match) => {
      return match.replace(/\s*\|\|\s*/g, " OR ");
    },
  );

  if (
    cleaned.includes("ALTER TABLE") && cleaned.includes("UPDATE") &&
    cleaned.includes("SET")
  ) {
    // We pass
  } else {
    // We do a second pass
    cleaned = cleaned.replace(/ null(?=\s|$)/g, " NULL") // space after or end of string
      .replace(/ != NULL/g, " NOT NULL")
      .replace(/ = NULL/g, " IS NULL");
  }

  return cleaned.trim();
}
