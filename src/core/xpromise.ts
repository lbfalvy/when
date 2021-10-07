import { event } from "@lbfalvy/mini-events"
import { addPromiseMethods } from "./addPromiseMethods"
import { Reject, Resolve } from "./flatPromise"
import { handleExecutor, Executor } from "./handleExecutor"
import { runHandler } from "./runHandler"
import { Handler, XPromise, XPromiseBase } from "./types"

export function xPromise<T>(executor: Executor<T>, eager = false): XPromise<T> {
    const { promise, execute, onStatus, cancel } = handleExecutor(executor, flatXPromise)
    if (eager) execute()
    const xpromise: XPromise<T> = addPromiseMethods(Object.setPrototypeOf({
        then<U, V>(onfulfilled: Handler<T, U>, onrejected: Handler<any, V>, sync: 'sync'|void) {
            // Eliminate unhandled promise rejections.
            promise.catch(() => {})
            const [rval, resolve, reject, onCancel] = flatXPromise<U | V>()
            const react = () => {
                switch (promise.status) {
                    case 'fulfilled':
                        if (onfulfilled) onCancel(runHandler(onfulfilled, promise.value, resolve, reject))
                        else resolve(promise.value as T & U)
                        break;
                    case 'rejected':
                        if (onrejected) onCancel(runHandler(onrejected, promise.reason, resolve, reject))
                        else reject(promise.reason)
                        break;
                    default: break;
                }
            }
            const handler = sync ? react : () => queueMicrotask(react)
            if (promise.status !== 'pending') handler()
            else onStatus(handler, true, true)
            execute()
            return rval
        },
        execute() {
            execute()
            return xpromise
        }
    } as XPromiseBase<T>, promise), cancel)
    return xpromise
}

export function eagerXPromise<T>(executor: Executor<T>): XPromise<T> {
    return xPromise(executor, true)
}

export function flatXPromise<T>(): [XPromise<T>, Resolve<T>, Reject, (f: () => any) => () => void] {
    const [cancel, onCancel] = event<[]>()
    let resolve!: Resolve<T>, reject!: Reject
    const p = eagerXPromise<T>((res, rej) => {
        resolve = res
        reject = rej
        return cancel
    })
    return [p, resolve, reject, l => onCancel(l, true, true)]
}