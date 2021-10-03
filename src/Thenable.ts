import { XPromise } from "./core/types"

export type Thenable<T> = { then(cb: (v: T) => any): Thenable<any> }