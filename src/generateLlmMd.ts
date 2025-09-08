import * as fs from "node:fs";

// #region Type Definitions
// These interfaces define the structure of the Deno Doc JSON output.

interface JsDocTag {
  kind: string;
  name?: string;
  doc?: string;
  type?: string;
}

interface JsDoc {
  doc?: string;
  tags?: JsDocTag[];
}

// Represents a TypeScript type definition from the JSON
interface TsTypeDef {
  repr: string;
  kind:
    | "keyword"
    | "typeRef"
    | "array"
    | "union"
    | "typeLiteral"
    | "fnOrConstructor"
    | "parenthesized"
    | "literal"
    | "typePredicate"
    | "intersection"
    | "mapped"
    | "indexedAccess"
    | "typeOperator"
    | "tuple";
  keyword?: string;
  typeRef?: {
    typeName: string;
    typeParams?: TsTypeDef[];
  };
  array?: TsTypeDef;
  union?: TsTypeDef[];
  intersection?: TsTypeDef[];
  parenthesized?: TsTypeDef;
  typeLiteral?: {
    properties: { name: string; optional?: boolean; tsType?: TsTypeDef }[];
    indexSignatures: { params: Param[]; tsType?: TsTypeDef }[];
  };
  fnOrConstructor?: {
    params: Param[];
    tsType?: TsTypeDef; // This is actually the return type in Deno's JSON
    returnType?: TsTypeDef; // Keep this for backward compatibility
  };
  literal?: {
    kind: "string" | "number" | "boolean";
    string?: string;
    number?: number;
    boolean?: boolean;
  };
  typePredicate?: {
    asserts?: boolean;
    param?: {
      type: string;
      name: string;
    };
    type?: TsTypeDef;
  };
  mappedType?: {
    typeParam: {
      name: string;
      constraint?: TsTypeDef;
    };
    tsType?: TsTypeDef;
  };
  indexedAccess?: {
    readonly: boolean;
    objType: TsTypeDef;
    indexType?: TsTypeDef;
  };
  typeOperator?: {
    operator: string;
    tsType: TsTypeDef;
  };
  tuple?: TsTypeDef[];
}

interface Param {
  kind: string;
  name: string;
  optional?: boolean;
  tsType?: TsTypeDef;
  left?: Param; // Added to handle 'assign' parameter kinds
}

interface TypeParam {
  name: string;
  constraint?: TsTypeDef;
}

interface FunctionDef {
  params: Param[];
  returnType?: TsTypeDef;
  isAsync: boolean;
  isGenerator: boolean;
  typeParams?: TypeParam[];
}

interface ClassMethodDef extends FunctionDef {
  // Inherits from FunctionDef and can have more properties
  typeParams?: TypeParam[];
}

interface ClassMethod {
  name: string;
  kind: "method";
  jsDoc?: JsDoc;
  functionDef: ClassMethodDef;
}

interface ClassConstructor {
  name: "constructor";
  jsDoc?: JsDoc;
  params: Param[];
}

interface ClassDef {
  isAbstract: boolean;
  constructors: ClassConstructor[];
  methods: ClassMethod[];
}

interface DocNode {
  name: string;
  kind: "moduleDoc" | "function" | "class" | "import";
  declarationKind: "export" | "private";
  jsDoc?: JsDoc;
  functionDef?: FunctionDef;
  classDef?: ClassDef;
}

interface DenoDoc {
  nodes: DocNode[];
}

// #endregion

/**
 * Recursively generates a string representation for a TypeScript type.
 * @param tsType - The type definition object from the doc JSON.
 * @returns A string representation of the type, e.g., "string[]" or "{ id: number }".
 */
function generateTypeRepr(tsType?: TsTypeDef): string {
  if (!tsType) return "any";

  // Clean ANSI color codes from repr if it exists
  const ansiRegex = new RegExp(String.fromCharCode(27) + "\\[[0-9;]*m", "g");
  const cleanRepr = tsType.repr?.replace(ansiRegex, "");

  // Don't use repr if we have type parameters to process or if repr is empty
  // Also skip repr for literal types so they get quoted properly
  if (
    cleanRepr && cleanRepr.trim() !== "" && tsType.kind !== "typeRef" &&
    tsType.kind !== "literal"
  ) {
    return cleanRepr;
  }

  switch (tsType.kind) {
    case "keyword":
      return tsType.keyword ?? "any";
    case "typeRef":
      if (tsType.typeRef?.typeParams?.length) {
        const params = tsType.typeRef.typeParams.map(generateTypeRepr).join(
          ", ",
        );
        return `${tsType.typeRef.typeName}<${params}>`;
      }
      return tsType.typeRef?.typeName ?? "any";
    case "array":
      return `${generateTypeRepr(tsType.array)}[]`;
    case "union":
      return tsType.union?.map(generateTypeRepr).join(" | ") ?? "any";
    case "intersection":
      return tsType.intersection?.map(generateTypeRepr).join(" & ") ?? "any";
    case "parenthesized":
      // Handle parenthesized types (e.g., (string | number))
      return `(${generateTypeRepr(tsType.parenthesized)})`;
    case "typePredicate": {
      if (!tsType.typePredicate) return "boolean";
      const { asserts, param, type } = tsType.typePredicate;
      if (asserts && param && type) {
        return `asserts ${param.name} is ${generateTypeRepr(type)}`;
      }
      if (param && type) {
        return `${param.name} is ${generateTypeRepr(type)}`;
      }
      return "boolean";
    }
    case "mapped": {
      if (!tsType.mappedType) return "any";
      const { typeParam, tsType: mappedTsType } = tsType.mappedType;
      const constraint = typeParam.constraint
        ? ` in ${generateTypeRepr(typeParam.constraint)}`
        : "";
      const valueType = mappedTsType ? generateTypeRepr(mappedTsType) : "any";
      return `{ [${typeParam.name}${constraint}]: ${valueType} }`;
    }
    case "indexedAccess": {
      if (!tsType.indexedAccess) return "any";
      const objType = generateTypeRepr(tsType.indexedAccess.objType);
      const indexType = tsType.indexedAccess.indexType
        ? generateTypeRepr(tsType.indexedAccess.indexType)
        : "any";
      return `${objType}[${indexType}]`;
    }
    case "typeOperator": {
      if (!tsType.typeOperator) return "any";
      const operandType = generateTypeRepr(tsType.typeOperator.tsType);
      return `${tsType.typeOperator.operator} ${operandType}`;
    }
    case "tuple": {
      if (!tsType.tuple?.length) return "[]";
      const elements = tsType.tuple.map(generateTypeRepr);
      return `[${elements.join(", ")}]`;
    }
    case "typeLiteral": {
      if (tsType.typeLiteral?.indexSignatures?.length) {
        const sig = tsType.typeLiteral.indexSignatures[0];
        const keyType = generateTypeRepr(sig.params[0].tsType);
        const valueType = generateTypeRepr(sig.tsType);
        return `Record<${keyType}, ${valueType}>`;
      }
      if (tsType.typeLiteral?.properties?.length) {
        const props = tsType.typeLiteral.properties.map((prop) => {
          return `${prop.name}${prop.optional ? "?" : ""}: ${
            generateTypeRepr(prop.tsType)
          }`;
        }).join("; ");
        return `{ ${props} }`;
      }
      return "{}";
    }
    case "fnOrConstructor": {
      if (!tsType.fnOrConstructor) return "Function";
      const params = tsType.fnOrConstructor.params.map((p) => {
        const paramName = p.name;
        const paramType = generateTypeRepr(p.tsType);
        return `${paramName}: ${paramType}`;
      }).join(", ");
      // In Deno's JSON, the return type is stored in tsType, not returnType
      const returnType = generateTypeRepr(
        tsType.fnOrConstructor.tsType || tsType.fnOrConstructor.returnType,
      );
      return `(${params}) => ${returnType}`;
    }
    case "literal": {
      if (tsType.literal?.kind === "string") {
        return `"${tsType.literal.string}"`;
      }
      if (tsType.literal?.kind === "number") {
        return `${tsType.literal.number}`;
      }
      if (tsType.literal?.kind === "boolean") {
        return `${tsType.literal.boolean}`;
      }
      return tsType.repr || "any";
    }
    default:
      // Fallback to repr if available and not empty
      return (tsType.repr && tsType.repr.trim() !== "") ? tsType.repr : "any";
  }
}

/**
 * Extracts a specific tag from a JSDoc block.
 * @param node - The documentation node.
 * @param kind - The kind of tag to extract (e.g., 'param', 'return').
 * @returns An array of matching tags.
 */
const getJsDocTag = (node: DocNode, kind: string): JsDocTag[] => {
  return node.jsDoc?.tags?.filter((tag) => tag.kind === kind) ?? [];
};

/**
 * Generates Markdown for a function's signature.
 * @param node - The function documentation node.
 * @returns A string containing the Markdown for the signature.
 */
const generateSignature = (node: DocNode): string => {
  if (!node.functionDef) return "";

  // Generate type parameters if they exist
  let typeParams = "";
  if (node.functionDef.typeParams?.length) {
    const typeParamStrings = node.functionDef.typeParams.map((tp) => {
      if (tp.constraint) {
        const constraintRepr = generateTypeRepr(tp.constraint);
        return `${tp.name} extends ${constraintRepr}`;
      }
      return tp.name;
    });
    typeParams = `<${typeParamStrings.join(", ")}>`;
  }

  const params = node.functionDef.params.map((p) => {
    let name = "";
    let typeInfo: TsTypeDef | undefined;
    let isOptional = p.optional;

    if (p.kind === "identifier") {
      name = p.name;
      typeInfo = p.tsType;
    } else if (p.kind === "assign" && p.left?.kind === "identifier") {
      name = p.left.name;
      typeInfo = p.left.tsType;
      isOptional = true; // Parameters with default values are optional
    }

    const typeRepr = generateTypeRepr(typeInfo);
    const type = typeRepr ? `: ${typeRepr}` : "";
    return `${name}${isOptional ? "?" : ""}${type}`;
  }).join(", ");
  const returnType = generateTypeRepr(node.functionDef.returnType);
  return `\`\`\`typescript\n${
    node.functionDef.isAsync ? "async " : ""
  }function ${node.name}${typeParams}(${params}): ${returnType};\n\`\`\`\n`;
};

/**
 * Generates Markdown for a specific function node.
 * @param node - The function documentation node.
 * @returns A string containing the Markdown for the function.
 */
const generateFunctionMarkdown = (node: DocNode): string => {
  let md = `## ${node.name}\n\n`;
  if (node.jsDoc?.doc) {
    md += `${node.jsDoc.doc.trim()}\n\n`;
  }

  md += `### Signature\n${generateSignature(node)}\n`;

  const params = getJsDocTag(node, "param");
  if (params.length > 0) {
    md += "### Parameters\n\n";
    params.forEach((param) => {
      md += `* **\`${param.name}\`**: ${
        param.doc?.replace(/\n/g, " ").trim() ?? ""
      }\n`;
    });
    md += "\n";
  }

  const returns = getJsDocTag(node, "return")[0];
  if (returns?.doc) {
    md += `### Returns\n\n${returns.doc.trim()}\n\n`;
  }

  const throws = getJsDocTag(node, "throws");
  if (throws.length > 0) {
    md += "### Throws\n\n";
    throws.forEach((t) => {
      md += `* **\`${t.type}\`**: ${t.doc?.replace(/\n/g, " ").trim() ?? ""}\n`;
    });
    md += "\n";
  }

  const examples = getJsDocTag(node, "example");
  if (examples.length > 0) {
    md += "### Examples\n\n";
    examples.forEach((example) => {
      md += `${example.doc?.trim()}\n\n`;
    });
  }
  return md;
};

/**
 * Generates Markdown for a specific class node.
 * @param node - The class documentation node.
 * @returns A string containing the Markdown for the class.
 */
const generateClassMarkdown = (node: DocNode): string => {
  if (!node.classDef) return "";
  let md = `## class ${node.name}\n\n`;
  if (node.jsDoc?.doc) {
    md += `${node.jsDoc.doc.trim()}\n\n`;
  }

  // Constructor
  const constructor = node.classDef.constructors[0];
  if (constructor?.jsDoc) {
    md += "### Constructor\n\n";
    if (constructor.jsDoc.doc) {
      md += `${constructor.jsDoc.doc.trim()}\n\n`;
    }
    const params = getJsDocTag(
      { jsDoc: constructor.jsDoc } as DocNode,
      "param",
    );
    if (params.length > 0) {
      md += "#### Parameters\n\n";
      params.forEach((param) => {
        md += `* **\`${param.name}\`**: ${
          param.doc?.replace(/\n/g, " ").trim() ?? ""
        }\n`;
      });
      md += "\n";
    }
  }

  // Methods
  if (node.classDef.methods.length > 0) {
    // Filter out internal methods
    const publicMethods = node.classDef.methods.filter((method) => {
      const isInternal = method.jsDoc?.tags?.some((tag) =>
        tag.kind === "internal"
      );
      return !isInternal;
    });

    if (publicMethods.length > 0) {
      md += "### Methods\n\n";
      publicMethods.forEach((method) => {
        md += `#### \`${method.name}\`\n\n`;
        if (method.jsDoc?.doc) {
          md += `${method.jsDoc.doc.trim()}\n\n`;
        }

        // Method signature
        if (method.functionDef) {
          // Generate type parameters if they exist
          let typeParams = "";
          if (method.functionDef.typeParams?.length) {
            const typeParamStrings = method.functionDef.typeParams.map((tp) => {
              if (tp.constraint) {
                const constraintRepr = generateTypeRepr(tp.constraint);
                return `${tp.name} extends ${constraintRepr}`;
              }
              return tp.name;
            });
            typeParams = `<${typeParamStrings.join(", ")}>`;
          }

          const params = method.functionDef.params.map((p) => {
            let name = "";
            let typeInfo: TsTypeDef | undefined;
            let isOptional = p.optional;

            if (p.kind === "identifier") {
              name = p.name;
              typeInfo = p.tsType;
            } else if (p.kind === "assign" && p.left?.kind === "identifier") {
              name = p.left.name;
              typeInfo = p.left.tsType;
              isOptional = true;
            }

            const typeRepr = generateTypeRepr(typeInfo);
            const type = typeRepr ? `: ${typeRepr}` : "";
            return `${name}${isOptional ? "?" : ""}${type}`;
          }).join(", ");

          const returnType = generateTypeRepr(method.functionDef.returnType);
          md += `##### Signature\n\`\`\`typescript\n${
            method.functionDef.isAsync ? "async " : ""
          }${method.name}${typeParams}(${params}): ${returnType};\n\`\`\`\n\n`;
        }

        // Method parameters
        const methodParams = getJsDocTag(
          { jsDoc: method.jsDoc } as DocNode,
          "param",
        );
        if (methodParams.length > 0) {
          md += "##### Parameters\n\n";
          methodParams.forEach((param) => {
            md += `* **\`${param.name}\`**: ${
              param.doc?.replace(/\n/g, " ").trim() ?? ""
            }\n`;
          });
          md += "\n";
        }

        // Method return type
        const methodReturns = getJsDocTag(
          { jsDoc: method.jsDoc } as DocNode,
          "return",
        )[0];
        if (methodReturns?.doc) {
          md += `##### Returns\n\n${methodReturns.doc.trim()}\n\n`;
        }

        // Method examples
        const examples = getJsDocTag(
          { jsDoc: method.jsDoc } as DocNode,
          "example",
        );
        if (examples.length > 0) {
          md += "##### Examples\n\n";
          examples.forEach((example) => {
            md += `${example.doc?.trim()}\n\n`;
          });
        }
      });
    }
  }

  const examples = getJsDocTag(node, "example");
  if (examples.length > 0) {
    md += "### Examples\n\n";
    examples.forEach((example) => {
      md += `${example.doc?.trim()}\n\n`;
    });
  }

  return md;
};

/**
 * Main function to generate the complete Markdown documentation.
 * @param jsonPath - The path to the input Deno Doc JSON file.
 * @param outputPath - The path where the output Markdown file will be saved.
 */
function generateMarkdown(jsonPath: string, outputPath: string) {
  try {
    console.log(`\nReading from ${jsonPath}...`);
    const jsonContent = fs.readFileSync(jsonPath, "utf-8");
    const docData: DenoDoc = JSON.parse(jsonContent);

    const publicNodes = docData.nodes
      .filter((node) =>
        node.declarationKind === "export" &&
        (node.kind === "function" || node.kind === "class") &&
        node.jsDoc?.doc &&
        !node.jsDoc?.tags?.some((tag) => tag.kind === "internal")
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(
      `Found ${publicNodes.length} public functions/classes to document.`,
    );

    let markdownContent = "";

    const moduleDoc = docData.nodes.find((node) => node.kind === "moduleDoc");
    if (moduleDoc?.jsDoc?.tags) {
      const moduleTag = moduleDoc.jsDoc.tags.find((tag) =>
        tag.kind === "module"
      );
      if (moduleTag?.name) {
        const [title, ...description] = moduleTag.name.split("\n");
        markdownContent += `# ${title.trim()}\n\n`;
        markdownContent += `${description.join("\n").trim()}\n\n`;
      }
    } else {
      markdownContent += "# API Reference\n\n";
    }

    publicNodes.forEach((node) => {
      if (node.kind === "function") {
        markdownContent += generateFunctionMarkdown(node);
      } else if (node.kind === "class") {
        markdownContent += generateClassMarkdown(node);
      }
      markdownContent += "\n\n"; // Add spacing between sections
    });

    fs.writeFileSync(outputPath, markdownContent);
    console.log(
      `✅ Markdown documentation successfully generated at ${outputPath}\n`,
    );
  } catch (error: unknown) {
    if ((error as { code: string }).code === "ENOENT") {
      console.error(`Error: Input file not found at ${jsonPath}`);
      console.error(
        "Please make sure 'docs.json' is in the same directory as this script.",
      );
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}

// --- Execution ---
const inputJson = "docs.json";
const outputMarkdown = "llm.md";

generateMarkdown(inputJson, outputMarkdown);
