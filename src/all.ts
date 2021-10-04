import xPromise from "./core/xpromise";
import { Thenable } from "./Thenable";
import { XPromise } from "./core/types";

/*
Code generated with the lines
range = number => { a = []; while(number > 0) a.unshift(--number); return a }
range(10).map(n => `export default function all<${range(n+1).map(k => `T${k}`).join(', ')}>(input: [${range(n+1).map(k => `T${k} | Thenable<T${k}>`).join(', ')}]): XPromise<[${range(n+1).map(k => `T${k}`).join(', ')}]>;`).join("\n")
 */

export default function all<T0>(input: [T0 | Thenable<T0>]): XPromise<[T0]>;
export default function all<T0, T1>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>]): XPromise<[T0, T1]>;
export default function all<T0, T1, T2>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>]): XPromise<[T0, T1, T2]>;
export default function all<T0, T1, T2, T3>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>]): XPromise<[T0, T1, T2, T3]>;
export default function all<T0, T1, T2, T3, T4>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>]): XPromise<[T0, T1, T2, T3, T4]>;
export default function all<T0, T1, T2, T3, T4, T5>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>]): XPromise<[T0, T1, T2, T3, T4, T5]>;
export default function all<T0, T1, T2, T3, T4, T5, T6>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>]): XPromise<[T0, T1, T2, T3, T4, T5, T6]>;
export default function all<T0, T1, T2, T3, T4, T5, T6, T7>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>]): XPromise<[T0, T1, T2, T3, T4, T5, T6, T7]>;
export default function all<T0, T1, T2, T3, T4, T5, T6, T7, T8>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>]): XPromise<[T0, T1, T2, T3, T4, T5, T6, T7, T8]>;
export default function all<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(input: [T0 | Thenable<T0>, T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable<T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>]): XPromise<[T0, T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
export default function all<T>(input: (T | Thenable<T>)[]): XPromise<T[]>
export default function all<T>(input: (T | Promise<T> | XPromise<T>)[]): XPromise<T[]> {
    return xPromise((resolve, reject) => {
        let resolvedCount = 0;
        const results: T[] = new Array(input.length)
        const fulfillHandler = (i: number, r: T) => {
            results[i] = r
            resolvedCount++
            if (resolvedCount == input.length) resolve(results)
        }
        input.forEach((p, i) => {
            if ('typeid' in p && p.typeid == 'XPromise') {
                p.then(r => fulfillHandler(i, r), reject, 'sync')
            } else if (p instanceof Promise) {
                p.then(r => fulfillHandler(i, r), reject).catch(() => {})
            } else fulfillHandler(i, p)
        })
    })
}