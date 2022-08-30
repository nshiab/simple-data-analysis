import saveDocument_ from "../methods/exporting/saveDocument.js";
import checkEnvironment from "../helpers/checkEnvironment.js";

export default class SimpleDocument {
  protected _components: (JSX.Element | string)[];
  verbose: boolean
  noLogs: boolean

  constructor({
    verbose = false,
    noLogs = false
  }: {
    verbose?: boolean
    noLogs?: boolean
  } = {}) {
    if (checkEnvironment() !== "nodejs") {
      throw new Error("SimpleDocument is available for NodeJS only.");
    }
    this._components = [];
    this.verbose = !noLogs && verbose
    this.noLogs = noLogs
  }

  get components() {
    return this._components;
  }
  set components(components: (JSX.Element | string)[]) {
    this._components = components;
  }

  add({ component }: { component: JSX.Element | string }) {
    this._components.push(component);
    return this;
  }

  saveDocument({ path }: { path: string }) {
    saveDocument_(this.components, path, this.verbose);

    return this;
  }
}
