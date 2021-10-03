import xPromise, { eagerXPromise, flatXPromise } from "../../src/core/xpromise"

describe('XPromise function and two variants', () => {
    test('executor called synchronously when then is called', () => {
        const ex = jest.fn()
        const p = xPromise(ex)
        expect(ex).toHaveBeenCalledTimes(0)
        p.then(null, null, 'sync')
        expect(ex).toHaveBeenCalledTimes(1)
    })

    test('argument of resolve passed to fulfill handler', () => {
        const p = xPromise(resolve => resolve('foo'))
        const fulfill = jest.fn()
        const reject = jest.fn()
        p.then(fulfill, reject, 'sync')
        expect(fulfill).toHaveBeenCalledWith('foo')
        expect(reject).not.toHaveBeenCalled()
    })

    test('argument of reject passed to reject handler', () => {
        const p = xPromise((resolve, reject) => reject('foo'))
        const fulfill = jest.fn()
        const reject = jest.fn()
        p.then(fulfill, reject, 'sync')
        expect(fulfill).not.toHaveBeenCalled()
        expect(reject).toHaveBeenCalledWith('foo')
    })

    test('Awaitable', async () => {
        await xPromise(resolve => resolve('foo'))
    })

    test('without sync fulfill handler runs in microtask', async () => {
        const p = xPromise(resolve => resolve('foo'))
        const cb = jest.fn()
        p.then(cb)
        expect(cb).not.toHaveBeenCalled()
        await Promise.resolve()
        expect(cb).toHaveBeenCalledWith('foo')
    })

    test('after cancellation fulfill handler never called', () => {
        const cb = jest.fn()
        xPromise(resolve => resolve('foo'))
            .cancel(f => f())
            .then(cb, null, 'sync')
        expect(cb).not.toHaveBeenCalled()
        // This behavior looks counterintuitive, but it's a direct result of laziness, the
        // synchronous nature of cancellation and the then call coming after cancel.
    })

    // TODO: invent something for cancel propagation and/or that the promise returned by 'then' is wired up

    test('flatXPromise returns what is expected and calls cancel handler', () => {
        const [promise, resolve, reject, cancel] = flatXPromise()
        expect(promise.typeid).toBe('XPromise')
        expect(typeof resolve).toBe('function')
        expect(typeof reject).toBe('function')
        const cb = jest.fn()
        cancel(cb)
        expect(cb).toHaveBeenCalledTimes(0)
        promise.cancel()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    test('flatXPromise resolves when the resolve function is called', () => {
        const [promise, resolve] = flatXPromise<void>()
        resolve()
        expect(promise.status).toBe('fulfilled')
        const cb = jest.fn()
        promise.then(cb, null, 'sync')
        expect(cb).toHaveBeenCalled()
    })

    test('flatXPromise handles the promise rejection', () => {
        const [promise, _, reject] = flatXPromise<void>()
        const cb = jest.fn()
        promise.catch(cb, 'sync')
        reject('foo')
        expect(cb).toHaveBeenCalledWith('foo')
        expect(promise.status).toBe('rejected')
    })

    test('eagerXPromise runs the executor early and returns an xpromise', () => {
        const cb = jest.fn()
        const xpromise = eagerXPromise(cb)
        expect(cb).toHaveBeenCalled()
        expect(xpromise.typeid).toBe('XPromise')
    })
})