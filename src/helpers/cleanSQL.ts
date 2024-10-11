export default function cleanSQL(query: string) {
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
