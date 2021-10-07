import { XPromise } from "./types"

export function isXPromise<T>(p: any): p is XPromise<T> {
    return typeof p == 'object'
        && 'typeid' in p
        && p.typeid == 'XPromise'
        && p instanceof Promise
}