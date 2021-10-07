import { AnySettledState, AnyState, SettledStatus, Status } from "./BaseState"
import { flatPromise, Reject, Resolve } from "./flatPromise"
import { isXPromise } from "./isXPromise"
import { variable, Subscribe } from '@lbfalvy/mini-events'
import { ExposedState, XPromise } from "./types"

export type Executor<T> = (resolve: Resolve<T>, reject: Reject) => any

export type PromiseWithState<T> = Promise<T> & ExposedState<T>
type TypedPropertyDescriptorMap<T> = {
    [P in string & keyof T]: TypedPropertyDescriptor<T[P]>
}

export function handleExecutor<T>(
    executor: Executor<T>,
    flatXPromise: <T>() => [XPromise<T>, Resolve<T>, Reject, (f: () => any) => void]
): {
    promise: PromiseWithState<T>
    execute: () => void
    onStatus: Subscribe<[Status]>
    cancel: () => void
} {
    const [basePromise, resolvePromise, rejectPromise] = flatPromise<T>()
    const [status, onStatus, setStatus] = variable<Status>('pending')
    let value: T|undefined
    function resolve(result: T | XPromise<T> | Promise<T>) {
        if (status[0] !== 'pending') return
        if (isXPromise<T>(result))
            result.then(resolve, reject, 'sync')
        else if (result instanceof Promise)
            result.then(resolve, reject)
        else {
            value = result
            setStatus('fulfilled')
            resolvePromise(result)
        }
    }
    let reason: any
    function reject(error: any) {
        if (status[0] !== 'pending') return
        reason = error
        setStatus('rejected')
        rejectPromise(error)
    }
    function cancel() {
        if (status[0] !== 'pending') return
        setStatus('cancelled')
    }
    let didExecutorRun = false
    function execute() {
        if (didExecutorRun || status[0] !== 'pending') return;
        didExecutorRun = true
        try {
            const canceller = executor(resolve, reject)
            if (typeof canceller == 'function') {
                onStatus(current => {
                    if (current == 'cancelled') canceller()
                }, true, true)
            }
        } catch(e) { reject(e) }
    }
    function getState(): AnyState<T> {
        const { status, value, reason } = promise;
        return { status, value, reason } as any
    }
    let rejectionHandled = false
    let settle: XPromise<AnySettledState<T>>|undefined
    const promise = Object.defineProperties(basePromise, {
        status: { get: () => status[0] },
        value: { get: () => value },
        reason: { get: () => reason },
        rejectionHandled: { get: () => rejectionHandled },
        settle: { get: () => {
            if (settle) return settle
            const [fresh, resolve] = flatXPromise<AnySettledState<T>>()
            settle = fresh
            promise.catch(() => {}) // Waiting for a settle also handles rejections
            rejectionHandled = true
            if (status[0] !== 'pending') resolve(getState() as AnySettledState<T>)
            else onStatus(() => resolve(getState() as AnySettledState<T>), true, true)
            return fresh
        }}
    } as TypedPropertyDescriptorMap<ExposedState<T>>) as Promise<T> & ExposedState<T>
    return {
        promise,
        execute,
        onStatus,
        cancel
    }
}