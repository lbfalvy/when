export type Status = 'fulfilled'|'rejected'|'cancelled'|'pending'
export type SettledStatus = Exclude<Status, 'pending'>

export interface BaseState<T> {
    readonly status: Status
    readonly value?: T | undefined
    readonly reason?: any
}

export type Fulfilled<T> = {
    readonly status: 'fulfilled'
    readonly value: T
}
export type Rejected = {
    readonly status: 'rejected'
    readonly reason: any
}
export type Cancelled = { readonly status: 'cancelled' }
export type Pending = { readonly status: 'pending' }
export type AnyState<T> = BaseState<T> & (
    | Fulfilled<T>
    | Rejected
    | Cancelled
    | Pending
)
export type AnySettledState<T> = BaseState<T> & (
    | Fulfilled<T>
    | Rejected
    | Cancelled
)