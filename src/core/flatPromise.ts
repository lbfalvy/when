import { XPromise } from "./types";

export type Resolve<T> = (t: T | XPromise<T> | Promise<T>) => void
export type Reject = (e: any) => void
export function flatPromise<T>(): [Promise<T>, Resolve<T>, Reject] {
    let resolve!: Resolve<T>, reject!: Reject
    const promise = new Promise<T>((res, rej) => {
        resolve = res; reject = rej;
    })
    return [promise, resolve, reject]
}