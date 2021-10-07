import { ExposedState, XPromise, XPromiseBase, PromiseUtils } from "./types"

export function addPromiseMethods<T>(p: XPromiseBase<T> & ExposedState<T>, cancel: () => void): XPromise<T> {
    const instance = Object.assign(p, {
        catch(onrejected, sync) {
            return p.then(undefined, onrejected, sync)
        },
        finally(onsettled, sync) {
            if (!onsettled) return p.then(undefined, undefined, sync)
            return p.then(
                () => onsettled(),
                () => onsettled(),
                sync
            )
        },
        cancel(cb) {
            if (cb) cb(cancel)
            else cancel()
            return instance
        },
        typeid: 'XPromise'
    } as PromiseUtils<T>) as XPromise<T>
    return instance
}