import SimpleTable from "../../../src/class/SimpleTable.ts";

class _SpecializedTable extends SimpleTable {
  specializedMethod(): this {
    return this;
  }
}

async function checkPolymorphicExportTypes(
  table: _SpecializedTable,
): Promise<void> {
  const chart = () => ({} as HTMLElement);
  const pending: Promise<_SpecializedTable> = table.writeMap(chart, "map.svg");
  (await pending).specializedMethod();
  (await table.writeMap(chart, "map.svg")).specializedMethod();
  (await table.writeChart(chart, "chart.svg")).specializedMethod();
  (await table.toSheet("fixture")).specializedMethod();
  (await table.toDatawrapper("fixture")).specializedMethod();
  (await table.toGeoDatawrapper("fixture")).specializedMethod();
  (await table.logLineChart("x", "y")).specializedMethod();
  (await table.logDotChart("x", "y")).specializedMethod();
  (await table.logBarChart("x", "y")).specializedMethod();
  (await table.logHistogram("value")).specializedMethod();
}

// Type-check the calls without performing remote exports.
void checkPolymorphicExportTypes;
