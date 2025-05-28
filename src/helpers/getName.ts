export default function getName(file: string) {
  const nameSplit = file.split("/");
  const name = nameSplit[nameSplit.length - 1];
  if (!name.includes(".")) {
    return name; // Return the name directly if there's no extension
  }
  const nameWithoutExtension = name.split(".").slice(0, -1).join(".");
  return nameWithoutExtension;
}
