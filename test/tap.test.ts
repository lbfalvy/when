import { XPromise } from "../src/core/types"
import { tap } from "../src/tap"

describe('tap', () => {
    let obj!: { foo: (s: string) => string, bar: (s: string) => string }
    let foo!: jest.Mock<any, any>
    let bar!: jest.Mock<any, any>
    let promise!: XPromise<[string]>

    beforeEach(() => {
        foo = jest.fn(); bar = jest.fn();
        obj = { foo, bar }
        promise = tap(obj, 'foo', 'bar')
    })

    test('reacts to calls to a method on an object', () => {
        obj.foo('quack')
        expect(promise.value).toEqual(['quack'])
    })

    test('rejects when the second argument is called', () => {
        promise.catch(() => {})
        obj.bar('error')
        expect(promise.reason).toEqual(['error'])
    })

    test('relays the call and return value', () => {
        foo.mockReturnValue('returned')
        expect(obj.foo('argument')).toBe('returned')
        expect(foo).toHaveBeenCalledWith('argument')
    })

    test('cleans up after itself', () => {
        obj.foo('argument')
        expect(obj.foo).toBe(foo)
        expect(obj.bar).toBe(bar)
    })

    test('cleans up after cancel', () => {
        promise.cancel()
        expect(obj.foo).toBe(foo)
        expect(obj.bar).toBe(bar)
    })

    // Actually works
    // Also rejects
    // Relays calls
    // Cleans up after either by properly resetting the entries
    // Cleans up after cancel
})