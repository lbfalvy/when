import addPromiseMethods from "./addPromiseMethods"
import { Reject, Resolve } from "./flatPromise"
import handleExecutor, { Executor } from "./handleExecutor"
import runHandler from "./runHandler"
import { Handler, XPromise, XPromiseBase } from "./types"

export default function xPromise<T>(executor: Executor<T>, eager = false): XPromise<T> {
    const { promise, execute, onStatus, cancel } = handleExecutor(executor, flatXPromise)
    let thenCalled = false
    if (eager) execute()
    const xpromise: XPromise<T> = addPromiseMethods(Object.setPrototypeOf({
        then<U, V>(onfulfilled: Handler<T, U>, onrejected: Handler<any, V>, sync: 'sync'|void) {
            // Eliminate unhandled promise rejections.
            thenCalled = true
            promise.catch(() => {})
            const [rval, resolve, reject, onCancel] = flatXPromise<U | V>()
            const react = () => {
                switch (promise.status) {
                    case 'fulfilled':
                        onCancel(runHandler(onfulfilled, promise.value, resolve, reject))
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
            else onStatus(handler)
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

export function flatXPromise<T>(): [XPromise<T>, Resolve<T>, Reject, (f: () => any) => any] {
    let resolve!: Resolve<T>, reject!: Reject, cancel!: (f: () => any) => any
    const p = eagerXPromise<T>((res, rej) => {
        resolve = res
        reject = rej
        const cancellers: (() => any)[] = []
        cancel = cancellers.push.bind(cancellers)
        return () => cancellers.forEach(f => f())
    })
    return [p, resolve, reject, cancel]
}