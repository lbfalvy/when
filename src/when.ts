import { all } from "./all"
import { allSettled } from "./allSettled"
import { callback } from "./callback"
import { Cancelled, Fulfilled, Rejected } from "./core/BaseState"
import { Reject, Resolve } from "./core/flatPromise"
import { Executor } from "./core/handleExecutor"
import { isXPromise } from "./core/isXPromise"
import { XPromise, XPromiseBase } from "./core/types"
import { xPromise, eagerXPromise, flatXPromise } from "./core/xpromise"
import { event, AnyEventTarget } from "./event"
import { cancel, reject, resolve } from "./primitives"
import { any } from "./any"
import { tap } from "./tap"
import { timeout } from "./timeout"

function when(timeout: number): XPromise<void>
function when<T>(sync: 'sync'|void): [XPromise<T>, Resolve<T>, Reject, XPromise<void>]
function when<T>(wrapped: Promise<T>): XPromise<T>
function when<T>(executor: Executor<T>, sync: 'sync'|void): XPromise<T>
function when<T extends string, U>(wrapped: AnyEventTarget<T, U>, event: T): XPromise<U>
function when<T, U extends string>(
    arg1?: number | Promise<T> | AnyEventTarget<U, T> | Executor<T> | 'sync' | void,
    arg2?: U | 'sync' | void
): any {
    if (typeof arg1 == 'number' && arg2 == undefined) return timeout(arg1)
    if ((arg1 == undefined || arg1 == 'sync') && arg2 == undefined) return flatXPromise<T>(arg1)
    if (arg1 instanceof Promise && arg2 == undefined) return xPromise(arg1.then.bind(arg1))
    if (typeof arg1 == 'function' && (arg2 == undefined || arg2 == 'sync'))
        return xPromise(arg1, arg2 as 'sync'|void)
    if (arg1 !== undefined && arg1 !== null && typeof arg2 == 'string')
        return event(arg1 as AnyEventTarget<U, T>, arg2 as U)
    throw new Error(`Incorrect parameters: ${arg1?.toString() ?? arg1} and ${arg2?.toString() ?? arg2}`)
}

interface When {
    eager<T>(executor: Executor<T>): XPromise<T>
    resolve<T>(value: T): XPromiseBase<T> & Fulfilled<T>
    reject(e: any): XPromiseBase<any> & Rejected
    cancel(): XPromiseBase<any> & Cancelled
    tap: typeof tap
    cb: typeof callback
    all: typeof all
    any: typeof any
    allSettled: typeof allSettled
    isXPromise: typeof isXPromise
}

const mainFunc = Object.assign(when, {
    eager: eagerXPromise,
    cb: callback,
    tap,
    all, any, allSettled,
    resolve, reject, cancel,
    isXPromise
} as When)

export { mainFunc as when }