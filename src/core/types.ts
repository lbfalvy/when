import { AnySettledState, AnyState } from "./BaseState"

export type Handler<T, U> = ((t: T) => U | Promise<U> | XPromise<U>) | null | undefined

export type ExposedState<T> = AnyState<T> & {
    readonly rejectionHandled: boolean
    readonly settle: XPromise<AnySettledState<T>>
}

export interface XPromiseBase<T> extends Promise<T> {
    then<U = any, V = never>(
        fulfilled?: Handler<T, U>,
        rejected?: Handler<any, V>,
        sync?: 'sync'|void
    ): XPromise<U | V>
    execute(): XPromise<T>
}

export interface PromiseUtils<T> {
    catch<U>(
        rejected?: ((e: any) => U | Promise<U> | XPromise<U>) | null | undefined,
        sync?: 'sync'|void
    ): XPromise<U>
    finally(
        settled?: (() => any) | null | undefined,
        sync?: 'sync'|void
    ): this
    cancel(cb?: (cb: () => void) => any): XPromise<T>
    typeid: 'XPromise'
}

export type XPromise<T> = XPromiseBase<T> & PromiseUtils<T> & ExposedState<T>