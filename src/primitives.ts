import { xPromise } from "./core/xpromise"

export const resolve = <T>(v: T) => xPromise<T>(resolve => resolve(v))
export const reject = (e: any) => xPromise((_, reject) => reject(e))
export const cancel = () => {
    const p = xPromise(() => {})
    p.cancel()
    return p
}