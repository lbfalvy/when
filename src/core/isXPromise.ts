import { XPromise } from "./types"

export default function isXPromise<T>(p: any): p is XPromise<T> {
    return typeof p == 'object'
        && 'typeid' in p
        && p.typeid == 'XPromise'
        && p instanceof Promise
}