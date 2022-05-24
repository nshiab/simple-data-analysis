import saveDocument_ from "../methods/exporting/saveDocument.js";
import checkEnvironment from "../helpers/checkEnvironment.js";

export default class SimpleDocument {
  _components: (JSX.Element | string)[];

  constructor() {
    if (checkEnvironment() !== "nodejs") {
      throw new Error("SimpleDocument is available for NodeJS only.");
    }
    this._components = [];
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
    saveDocument_(this.components, path);

    return this;
  }
}
