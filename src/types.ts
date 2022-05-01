export interface ArrayOfObjects {
    length: any
    [key: symbol]: string | number | boolean
}[]

export interface Options {
    logs: boolean,
    encoding?: BufferEncoding
}
