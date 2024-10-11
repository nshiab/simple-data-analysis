export default function shouldFlipBeforeExport(projection: string) {
  return projection.includes("proj=latlong");
}
