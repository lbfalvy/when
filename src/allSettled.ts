import { AnySettledState } from "./core/BaseState"
import { xPromise } from "./core/xpromise"
import { XPromise } from "./core/types"
import { Thenable } from "./Thenable"

type SettledResult<T> = 
    | {
        status: 'fulfilled'
        value: T
    } | {
        status: 'rejected'
        reason: any
    } | { status: 'cancelled' }
export type AllSettledResult<T extends Thenable<any>[]> = {
    [P in keyof T & number]: T[P] extends Thenable<infer U> ? SettledResult<U> : never
} & { length: T['length'] } & any[]

/*
Code generated with the lines
range = number => { a = []; while(number > 0) a.unshift(--number); return a }
range(5).map(n => `export function allSettled<${range(n+1).map(k => `T${k}`).join(', ')}>(input: [${range(n+1).map(k => `Thenable<T${k}>`).join(', ')}]): XPromise<[${range(n+1).map(k => `SettledResult<T${k}>`).join(', ')}]>;`).join("\n")

Note: it's only generated up to 5 parameters because otherwise Typescript exceeds its recursion limit.
*/

export function allSettled<T0>(input: [Thenable<T0>]): XPromise<[SettledResult<T0>]>;
export function allSettled<T0, T1>(input: [Thenable<T0>, Thenable<T1>]): XPromise<[SettledResult<T0>, SettledResult<T1>]>;
export function allSettled<T0, T1, T2>(input: [Thenable<T0>, Thenable<T1>, Thenable<T2>]): XPromise<[SettledResult<T0>, SettledResult<T1>, SettledResult<T2>]>;
export function allSettled<T0, T1, T2, T3>(input: [Thenable<T0>, Thenable<T1>, Thenable<T2>, Thenable<T3>]): XPromise<[SettledResult<T0>, SettledResult<T1>, SettledResult<T2>, SettledResult<T3>]>;
export function allSettled<T0, T1, T2, T3, T4>(input: [Thenable<T0>, Thenable<T1>, Thenable<T2>, Thenable<T3>, Thenable<T4>]): XPromise<[SettledResult<T0>, SettledResult<T1>, SettledResult<T2>, SettledResult<T3>, SettledResult<T4>]>;
export function allSettled<T>(input: (T | Thenable<T>)[]): XPromise<SettledResult<T>[]>
export function allSettled<T>(input: (T | Promise<T> | XPromise<T>)[]): XPromise<SettledResult<T>[]> {
    return xPromise(resolve => {
        let settledCount = 0
        const results: SettledResult<T>[] = new Array(input.length)
        const afterSettle = () => {
            settledCount++
            if (settledCount == input.length) resolve(results)
        }
        const resolveHandler = (i: number, value: T) => {
            results[i] = { status: 'fulfilled', value }
            afterSettle()
        }
        const rejectHandler = (i: number, reason: any) => {
            results[i] = { status: 'rejected', reason }
            afterSettle()
        }
        const settleHandler = (i: number, state: AnySettledState<T>) => {
            if (state.status == 'fulfilled') resolveHandler(i, state.value)
            else if (state.status == 'rejected') rejectHandler(i, state.reason)
            else if (state.status == 'cancelled') {
                results[i] = { status: 'cancelled' }
                afterSettle()
            } else throw new Error('Invalid status!')
        }
        input.forEach((entry, i) => {
            if ('typeid' in entry && entry.typeid == 'XPromise') {
                entry.settle.then(state => settleHandler(i, state))
            } else if (entry instanceof Promise) {
                entry.then(result => resolveHandler(i, result), e => rejectHandler(i, e))
            } else throw new Error('Not a promise!')
        })
    })
}