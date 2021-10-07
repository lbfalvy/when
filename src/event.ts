import { flatXPromise } from "./core/xpromise";
import { XPromise } from "./core/types";

export type AnyEventTarget<T extends string, U> =
    | { 
        addEventListener(event: T, callback: (object: U) => void): void
        removeEventListener(event: T, callback: (object: U) => void): void
    } | { 
        addListener(event: T, callback: (object: U) => void): void
        removeListener(event: T, callback: (object: U) => void): void
    } | { 
        on(event: T, callback: (object: U) => void): void
        off(event: T, callback: (object: U) => void): void
    }

export function event<T extends string, U>(target: AnyEventTarget<T, U>, event: T): XPromise<U> {
    type Eventfunc = (event: T, cb: (object: U) => void) => void
    const [rval, resolve, _, onCancel] = flatXPromise<U>()
    let subscribe: Eventfunc, unsubscribe: Eventfunc
    if ('addEventListener' in target) {
        subscribe = target.addEventListener.bind(target)
        unsubscribe = target.removeEventListener.bind(target)
    } else if ('addListener' in target) {
        subscribe = target.addListener.bind(target)
        unsubscribe = target.removeListener.bind(target)
    } else if ('on' in target) {
        subscribe = target.on.bind(target)
        unsubscribe = target.off.bind(target)
    } else throw new Error('Not an event target')
    const cb = (object: U) => {
        resolve(object)
        unsubscribe(event, cb)
    }
    onCancel(() => unsubscribe(event, cb))
    subscribe(event, cb)
    return rval
}