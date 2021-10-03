import { XPromise } from "./core/types"

export type Thenable<T> = { then(cb: (v: T) => any): Thenable<any> }

type PromiseArrayToArray<T extends Thenable<any>[]> = {
        [P in keyof T & number]: T[P] extends Thenable<infer U> ? U : never
    } & { length: T['length'] } & any[]

export default PromiseArrayToArray