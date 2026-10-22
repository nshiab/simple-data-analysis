import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Converter, DeclarationReflection, SignatureReflection, type Application } from "typedoc";
import ts from "typescript";

// Bundled declarations retain source-file regions, but npm packages have no Git
// checkout. Resolve their declarations against the shipped TypeScript source.
export function load(app: Application) {
  const files = new Map<string, { text: string; locations: ReturnType<typeof namedLocations> }>();
  function readSource(path: string) {
    let file = files.get(path);
    if (!file) {
      const text = readFileSync(path, "utf8");
      file = {
        text,
        locations: namedLocations(ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)),
      };
      files.set(path, file);
    }
    return file;
  }
  const updated = new WeakSet<object>();
  const cache = new Map<string, { fileName: string; line: number; url: string }>();
  app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
    for (const reflection of Object.values(context.project.reflections)) {
      if (
        !(reflection instanceof DeclarationReflection || reflection instanceof SignatureReflection)
      )
        continue;
      for (const source of reflection.sources ?? []) {
        if (updated.has(source)) continue;
        const match = source.fullFileName.match(/^(.*\/node_modules\/@nshiab\/([^/]+))\//);
        if (!match) continue;
        const [, root, repository] = match;
        const key = `${source.fullFileName}:${source.line}:${source.character}`;
        let resolved = cache.get(key);
        if (!resolved) {
          const declaration = readSource(source.fullFileName);
          const before = declaration.text.split("\n").slice(0, source.line).join("\n");
          const region = [...before.matchAll(/^\/\/#region (src\/.+)\.d\.ts$/gm)].at(-1);
          if (!region) throw new Error(`Missing source region for ${key}`);
          const fileName = `${region[1]}.ts`;
          const names = declaration.locations.find(
            (entry) => entry.line === source.line && entry.character === source.character,
          )?.names;
          const original = readSource(join(root, fileName)).locations.find(
            (entry) => entry.names === names,
          );
          if (!original) throw new Error(`Cannot locate original declaration for ${key}`);
          const metadata: unknown = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
          if (
            !metadata ||
            typeof metadata !== "object" ||
            !("version" in metadata) ||
            typeof metadata.version !== "string"
          ) {
            throw new Error(`Missing package version in ${root}`);
          }
          resolved = {
            fileName: `${repository}/${fileName}`,
            line: original.line,
            url: `https://github.com/nshiab/${repository}/blob/v${metadata.version}/${fileName}#L${original.line}`,
          };
          cache.set(key, resolved);
        }
        Object.assign(source, resolved);
        updated.add(source);
      }
    }
  });
}

function namedLocations(file: ts.SourceFile) {
  const locations: { names: string; line: number; character: number }[] = [];
  function visit(node: ts.Node, parents: string[]) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node) ||
      ts.isPropertyDeclaration(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isPropertySignature(node) ||
      ts.isMethodSignature(node)
    ) {
      if (node.name) {
        parents = [...parents, node.name.getText(file)];
        const position = file.getLineAndCharacterOfPosition(node.name.getStart(file));
        locations.push({
          names: parents.join("."),
          line: position.line + 1,
          character: position.character,
        });
      }
    }
    if (ts.isConstructorDeclaration(node)) {
      parents = [...parents, "constructor"];
      const position = file.getLineAndCharacterOfPosition(node.getStart(file));
      locations.push({
        names: parents.join("."),
        line: position.line + 1,
        character: position.character,
      });
    }
    ts.forEachChild(node, (child) => visit(child, parents));
  }
  visit(file, []);
  return locations;
}
