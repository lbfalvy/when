import handleExecutor from "../../src/core/handleExecutor"
import { XPromise } from "../../src/core/types"

type AnyFunc = (...args: any[]) => any

describe('Manages the state of an xpromise and exposes it through opaque handlers', () => {
    type FlatXPromiseMock = [XPromise<any>, jest.Mock<any, any>, jest.Mock<any, any>, jest.Mock<any, any>]
    let flatXPromises: FlatXPromiseMock[]
    let flatXPromise: jest.Mock<[XPromise<any>, AnyFunc, AnyFunc, AnyFunc], []>
    
    beforeEach(() => {
        flatXPromises = []
        flatXPromise = jest.fn(() => {
            const xpromise = Object.assign(new Promise(() => {}), {
                typeid: 'XPromise',
                then: jest.fn()
            }) as any as XPromise<any>
            const value = [
                xpromise,
                jest.fn(),
                jest.fn(),
                jest.fn()
            ] as FlatXPromiseMock
            flatXPromises.push(value)
            return value
        })
    })

    test('Initial state is correct', () => {
        const { promise } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        expect(promise.status).toBe('pending')
        expect(promise.value).toBe(undefined)
        expect(promise.reason).toBe(undefined)
    })

    test('Resolution works correctly', () => {
        const { promise, execute } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        execute()
        expect(promise.status).toBe('fulfilled')
        expect(promise.value).toBe('foo')
        expect(promise.reason).toBe(undefined)
    })

    test('Rejection updates state and rejects inner promise', async () => {
        const { promise, execute } = handleExecutor((_, reject) => reject('foo'), flatXPromise)
        const onThrow = jest.fn()
        promise.catch(onThrow)
        execute()
        expect(promise.status).toBe('rejected')
        expect(promise.value).toBe(undefined)
        expect(promise.reason).toBe('foo')
        await Promise.resolve() // Roll the event loop
        expect(onThrow).toHaveBeenCalledWith('foo')
    })

    test('Cancellation works correctly', () => {
        const { promise, cancel } = handleExecutor(() => {}, flatXPromise)
        cancel()
        expect(promise.status).toBe('cancelled')
        expect(promise.value).toBe(undefined)
        expect(promise.reason).toBe(undefined)
    })

    test('A resolved promise cannot be cancelled', () => {
        const { promise, execute, cancel } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        execute()
        cancel()
        expect(promise.status).toBe('fulfilled')
        expect(promise.value).toBe('foo')
    })

    test('A cancelled promise cannot be resolved', () => {
        const { promise, execute, cancel } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        cancel()
        execute()
        expect(promise.status).toBe('cancelled')
        expect(promise.value).toBe(undefined)
    })

    // Same for rejection isn't tested because in any remotely sane implementation it's symmetrical

    test('Settle returns whatever flatXPromise does', () => {
        const { promise } = handleExecutor(() => {}, flatXPromise)
        expect(promise.settle).toBe(flatXPromises[0][0])
    })

    test('Settle does not rerun flatXPromise', () => {
        const { promise } = handleExecutor(() => {}, flatXPromise)
        const first = promise.settle
        expect(promise.settle).toBe(first)
        expect(flatXPromises).toHaveLength(1)
    })

    test('onStatus calls its parameter when the promise resolves', () => {
        const { promise, execute, onStatus } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        const cb = jest.fn()
        onStatus(cb, true)
        execute()
        expect(cb).toHaveBeenCalled()
    })

    test('onStatus calls its parameter when the promise is cancelled', () => {
        const { promise, cancel, onStatus } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        const cb = jest.fn()
        onStatus(cb, true)
        cancel()
        expect(cb).toHaveBeenCalled()
    })

    test('onStatus is only called once', () => {
        const { promise, execute, cancel, onStatus } = handleExecutor((resolve, reject) => {
            resolve('foo')
            resolve('bar')
            reject('baz')
        }, flatXPromise)
        const cb = jest.fn()
        onStatus(cb, true)
        execute()
        cancel()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    test('Settle calls the second return value of flatXPromise when the promise resolves', () => {
        const { promise, execute } = handleExecutor(resolve => resolve('foo'), flatXPromise)
        const settle = promise.settle
        execute()
        expect(flatXPromises[0][1]).toHaveBeenCalledWith({ status: 'fulfilled', value: 'foo' })
    })

    test('Settle calls the second return value of flatXPromise when the promise cancels', () => {
        const { promise, cancel } = handleExecutor(() => {}, flatXPromise)
        const settle = promise.settle
        cancel()
        expect(flatXPromises[0][1]).toHaveBeenCalledWith({ status: 'cancelled' })
    })

    test('Settle resolves if promise resolved before obtaining', () => {
        const { promise, execute } = handleExecutor(res => res('foo'), flatXPromise)
        execute()
        const settle = promise.settle
        expect(flatXPromises[0][1]).toHaveBeenCalled()
    })
})