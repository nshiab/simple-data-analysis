import { assertEquals } from "@std/assert";
import {
  getDataDW,
  getInfoDW,
  updateDataDW,
  updateInfoDW,
} from "@nshiab/journalism-dataviz";

type ChartText = { title: string; description: string; note: string };

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected chart metadata object");
  }
  return value as Record<string, unknown>;
}

async function readText(chartId: string): Promise<ChartText> {
  const info = await getInfoDW(chartId);
  if (info instanceof Response) throw new Error("Expected chart object");
  const metadata = record(info.metadata);
  const title = info.title;
  const description = record(metadata.describe).intro;
  const note = record(metadata.annotate).notes;
  if (
    typeof title !== "string" || typeof description !== "string" ||
    typeof note !== "string"
  ) {
    throw new Error(
      "Expected string title, description, and notes before modifying test chart",
    );
  }
  return { title, description, note };
}

export default async function assertLiveDatawrapperExport(
  chartId: string,
  expectedData: string,
  exportTable: (options: Partial<ChartText>) => Promise<unknown>,
): Promise<void> {
  const originalText = await readText(chartId);
  const originalData = await getDataDW(chartId);
  if (typeof originalData !== "string") {
    throw new Error("Expected raw chart data");
  }
  const marker = crypto.randomUUID();
  const updated = {
    title: `SDA test title ${marker}`,
    description: `SDA test description ${marker}`,
    note: `SDA test note ${marker}`,
  };
  try {
    await exportTable(updated);
    assertEquals(await readText(chartId), updated);
    const actualData = await getDataDW(chartId);
    if (typeof actualData !== "string") {
      throw new Error("Expected raw chart data");
    }
    if (expectedData.trimStart().startsWith("{")) {
      // Datawrapper adds its own fields, such as locator-map markers.
      const actualGeoData = record(JSON.parse(actualData));
      const expectedGeoData = record(JSON.parse(expectedData));
      assertEquals(actualGeoData.type, expectedGeoData.type);
      assertEquals(actualGeoData.features, expectedGeoData.features);
    } else {
      assertEquals(actualData.trimEnd(), expectedData.trimEnd());
    }

    await exportTable({ title: `Partial update ${marker}` });
    assertEquals(await readText(chartId), {
      ...updated,
      title: `Partial update ${marker}`,
    });

    await exportTable({ note: "" });
    const partiallyCleared = {
      ...updated,
      title: `Partial update ${marker}`,
      note: "",
    };
    assertEquals(await readText(chartId), partiallyCleared);

    await exportTable({});
    assertEquals(await readText(chartId), partiallyCleared);

    await exportTable({ title: "", description: "" });
    assertEquals(await readText(chartId), {
      title: "",
      description: "",
      note: "",
    });
  } finally {
    // Attempt both restorations even if restoring the data fails. Never publish.
    try {
      await updateDataDW(chartId, originalData);
      assertEquals(await getDataDW(chartId), originalData);
    } finally {
      await updateInfoDW(chartId, originalText);
      assertEquals(await readText(chartId), originalText);
    }
  }
}
