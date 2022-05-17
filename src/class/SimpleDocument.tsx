import React from "react"
import saveDocument_ from "../methods/saveDocument.js"
import Table from "../components/Table.js"
import SimpleData from "../class/SimpleData.js"

export default class SimpleDocument {

    _components: any[]
    _theme: any
    _muiCache: any

    constructor(theme?: any) {
        this._components = []
    }

    get components() {
        return this._components
    }
    set components(components) {
        this._components = components
    }

    add(component: any) {
        if (component instanceof SimpleData) {
            const columns = Object.keys(component.data[0])
            const rows = component.data
            this._components.push(<Table columns={columns} rows={rows} />)
        } else {
            this._components.push(component)
        }
        return this
    }

    saveDocument(path: string) {
        saveDocument_(this.components, path)

        return this
    }



}