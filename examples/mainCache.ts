import { SimpleDB } from "@nshiab/simple-data-analysis";

// We enable the cacheVerbose option, which will
// log information about the cached data.
const sdb = new SimpleDB({ cacheVerbose: true });

const fires = sdb.newTable("fires");

// We cache these steps with a ttl of 60 seconds.
// On the first run, the data will be fetched
// and stored in the hidden folder .sda-cache.
// If you rerun the script less than 60 seconds
// later, the data won't be fetched but loaded
// from the local cache. However, if you run the
// code after 60 seconds, the data will be
// considered outdated and fetched again.
// After another 60 seconds, the new data in the cache will
// expire again. This is useful when working with scraped data.
// If you update the parameters or code passed to the cache
// method, everything starts over.
await fires.cache(
  async () => {
    await fires.loadData(
      "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
    );
    await fires.points("lat", "lon", "geom");
  },
  { ttl: 60 },
);

const provinces = sdb.newTable("provinces");

// Same thing here, except there is no ttl option,
// so the cached data will never expire unless you delete
// the hidden folder .sda-cache. Again, if you update
// the code passed to the cache method, everything
// starts over.
await provinces.cache(async () => {
  await provinces.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  );
});

const firesInsideProvinces = sdb.newTable("firesInsideProvinces");

// While caching is quite useful when fetching data,
// it's also handy for computationally expensive
// operations like joins and summaries.
// Since the fires table has a ttl of 60 seconds
// and we depend on it here, we need a ttl equal
// or lower. Otherwise, we won't work with
// up-to-date data.
await firesInsideProvinces.cache(
  async () => {
    await fires.joinGeo(provinces, "inside", {
      outputTable: "firesInsideProvinces",
    });
    await firesInsideProvinces.removeMissing();
    await firesInsideProvinces.summarize({
      values: "hectares",
      categories: "nameEnglish",
      summaries: ["count", "sum"],
      decimals: 0,
    });
    await firesInsideProvinces.renameColumns({
      count: "nbFires",
      sum: "burntArea",
    });
    await firesInsideProvinces.sort({ burntArea: "desc" });
  },
  { ttl: 60 },
);

await firesInsideProvinces.logTable(12);

// It's important to call done() at the end.
// This method will remove the unused files
// in the cache.
await sdb.done();
