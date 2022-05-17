import saveDocument_ from "../methods/saveDocument.js"

export default class SimpleDocument {

    _components: any[]

    constructor() {
        this._components = []
    }

    get components() {
        return this._components
    }
    set components(components) {
        this._components = components
    }

    add(component: any) {
        this._components.push(component)
        return this
    }

    saveDocument(path: string) {
        saveDocument_(this.components, path)

        return this
    }



}