export default function cleanSQL(query: string) {
  if (
    query.includes("ALTER TABLE") && query.includes("UPDATE") &&
    query.includes("SET")
  ) {
    return query;
  }

  const cleaned = query
    .replace(/ && /g, " AND ")
    .replace(/ & /g, " AND ")
    .replace(/ \|\| /g, " OR ")
    .replace(/ \| /g, " OR ")
    .replace(/ null(?=\s|$)/g, " NULL") // space after or end of string
    .replace(/ === /g, " = ")
    .replace(/ == /g, " = ")
    .replace(/ !== /g, " != ")
    .replace(/ != NULL/g, " NOT NULL")
    .replace(/ = NULL/g, " IS NULL");

  return cleaned;
}
