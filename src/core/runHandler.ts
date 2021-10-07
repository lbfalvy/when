import { Reject, Resolve } from "./flatPromise"
import { Handler } from "./types"

export function runHandler<T, U>(
    f: Handler<T, U>, arg: T,
    resolve: Resolve<U>, reject: Reject
): () => void {
    if (f) try {
        const result = f(arg)
        if (!result) resolve(result)
        else if (typeof result == 'object' && 'typeid' in result && result.typeid == 'XPromise') {
            result.then(resolve, reject, 'sync')
            return result.cancel
        } else if (result instanceof Promise) {
            (result as Promise<U>).then(resolve, reject)
        } else resolve(result)
    } catch(ex) { reject(ex) }
    return () => {}
}