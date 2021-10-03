export type Subscriber<T> = (f: (v: T, old?: T) => any) => () => void

// TODO: this could probably go in the tiny event package
export default function trackedVariable<T>(value: T): [
    [T],
    Subscriber<T>,
    (v: T) => void
] {
    let current: [T] = [value]
    const handlers: ((v: T, old?: T) => any)[] = []
    return [
        current,
        f => {
            const fresh = (v: T, old?: T) => f(v, old)
            handlers.push(fresh)
            return () => {
                const i = handlers.indexOf(fresh)
                handlers.splice(i, 1)
            }
        },
        v => {
            const old = current[0]
            current[0] = v
            handlers.forEach(f => f(v, old))
        }
    ]
}