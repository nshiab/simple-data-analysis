// Resolve the core documentation from the same import map as SDA itself.
// An unversioned JSR specifier can otherwise mix the current SDA API with
// documentation from a different core release.
const core = import.meta.resolve("@nshiab/simple-data-analysis-core");
const command = new Deno.Command(Deno.execPath(), {
  args: ["run", "-A", "jsr:@nshiab/deno-docs-to-md", `--jsr=${core}`],
});
const status = await command.spawn().status;
if (!status.success) {
  Deno.exit(status.code);
}
