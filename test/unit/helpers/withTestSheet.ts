import { openSpreadsheet } from "@nshiab/journalism-google";

export default async function withTestSheet(run: (url: string) => Promise<void>): Promise<void> {
  const url =
    "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit";
  const { spreadsheet } = await openSpreadsheet(url);
  const sheet = await spreadsheet.addSheet({ title: `sda-test-${crypto.randomUUID()}` });
  try {
    await run(`${url}#gid=${sheet.sheetId}`);
  } finally {
    await sheet.delete();
  }
}
