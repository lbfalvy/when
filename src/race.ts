import xPromise from "./core/xpromise";
import { Thenable } from "./Thenable";
import { XPromise } from "./core/types";

export default function race<T>(input: (T | Thenable<T> | XPromise<T>)[]): XPromise<T> {
    return xPromise((resolve, reject) => {
        let rejectedCount = 0;
        const errors: any[] = new Array(input.length)
        const errorHandler = (i: number, r: any) => {
            errors[i] = r
            rejectedCount++
            if (rejectedCount == input.length) reject(errors)
        }
        input.forEach((p, i) => {
            if ('typeid' in p && p.typeid == 'XPromise') {
                p.then(resolve, r => errorHandler(i, r), 'sync')
            } else if (p instanceof Promise) {
                p.then(resolve, r => errorHandler(i, r)).catch(() => {})
            } else resolve(p as T)
        })
    })
}