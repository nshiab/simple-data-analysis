export default function cleanSQL(query: string) {
  // First pass
  let cleaned = query
    .replace(/ && /g, " AND ")
    .replace(/ & /g, " AND ")
    .replace(/ \|\| /g, " OR ")
    .replace(/ \| /g, " OR ")
    .replace(/ === /g, " = ")
    .replace(/ == /g, " = ")
    .replace(/ !== /g, " != ");

  if (
    query.includes("ALTER TABLE") && query.includes("UPDATE") &&
    query.includes("SET")
  ) {
    // We pass
  } else {
    // We do a second pass
    cleaned = query.replace(/ null(?=\s|$)/g, " NULL") // space after or end of string
      .replace(/ != NULL/g, " NOT NULL")
      .replace(/ = NULL/g, " IS NULL");
  }

  return cleaned;
}
