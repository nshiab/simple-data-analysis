import exporting from "../methods/exporting/indexNode.js"
import helpers from "../helpers/index.js"

export default class SimpleDocument {
  _components: (JSX.Element | string)[];
  verbose: boolean
  noLogs: boolean

  constructor({
    verbose = false,
    noLogs = false
  }: {
    verbose?: boolean
    noLogs?: boolean
  } = {}) {
    if (helpers.checkEnvironment() !== "nodejs") {
        throw new Error("SimpleDocument is available for NodeJS only.")
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
    exporting.saveDocument_(this.components, path, this.verbose)

    return this;
  }
}
