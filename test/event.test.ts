import { event } from "../src/event"

type MockEventTarget<T extends string, K extends string> = {
    [P in T | K]: (name: string, cb: (ev: any) => any) => void
} & {
    listeners: Record<string, ((ev: any) => any)[]>
}

function mockEventTarget<T extends string, K extends string>(on: T, off: K): [
    MockEventTarget<T, K>,
    (name: string, event: any) => void
] {
    const listeners: Record<string, ((ev: any) => any)[]> = {}
    return [
        {
            [on as T | K]: (name: string, cb: (ev: any) => any) => {
                if (!listeners[name]) listeners[name] = []
                listeners[name].push(cb)
            },
            [off as T | K]: (name: string, cb: (ev: any) => any) => {
                const idx = listeners[name]?.indexOf(cb)
                if (typeof idx == 'number' && -1 < idx) listeners[name].splice(idx)
            },
            listeners
        } as MockEventTarget<T, K>,
        (name: string, ev: any) => listeners[name]?.forEach(f => f(ev))
    ]
}

describe('listens on EventTarget in various environments', () => {
    test('Relays events', () => {
        const [tgt, emit] = mockEventTarget('addListener', 'removeListener')
        const promise = event(tgt, 'foo')
        emit('foo', 'bar')
        expect(promise.status).toBe('fulfilled')
        expect(promise.value).toBe('bar')
    })

    test('Resets handlers afterwards', () => {
        const [tgt, emit] = mockEventTarget('addEventListener', 'removeEventListener')
        event(tgt, 'foo')
        emit('foo', 'bar')
        expect(tgt.listeners['foo']).toHaveLength(0)
    })

    test('Resets handlers on cancel', () => {
        const [tgt] = mockEventTarget('on', 'off')
        const promise = event(tgt, 'foo')
        promise.cancel()
        expect(tgt.listeners['foo']).toHaveLength(0)
    })
})