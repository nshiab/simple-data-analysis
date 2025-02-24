export default function cleanPath(file: string) {
  return file.replaceAll("'", "''");
}
