import { xPromise } from "./core/xpromise";
import { Thenable } from "./Thenable";
import { XPromise } from "./core/types";

export function race<T>(input: (T | Thenable<T> | XPromise<T>)[]): XPromise<T> {
    return xPromise(resolve => {
        input.forEach(p => {
            if (typeof p !== 'object') resolve(p as T)
            else if ('typeid' in p && p.typeid == 'XPromise') {
                p.then(resolve, resolve, 'sync')
            } else if (p instanceof Promise) {
                p.then(resolve, resolve).catch(() => {})
            } else resolve(p as T)
        })
    })
}