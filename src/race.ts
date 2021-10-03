import xPromise from "./core/xpromise";
import PromiseArrayToArray from "./PromiseArrayToArray";
import { XPromise } from "./core/types";

export default function race<T extends (Promise<any> | XPromise<any>)[]>(input: T): XPromise<PromiseArrayToArray<T>[number]> {
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
                p.then(resolve, r => errorHandler(i, r))
            }
        })
    })
}