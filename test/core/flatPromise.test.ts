import { flatPromise } from "../../src/core/flatPromise"

// This test suite only exists to make sure that Promise calls its executor synchronously.
describe('A little utility to obtain all parts of a promise', () => {
    test('all parts are actually returned', () => {
        const [promise, resolve, reject] = flatPromise()
        expect(promise).toBeInstanceOf(Promise)
        expect(typeof resolve).toBe('function')
        expect(typeof reject).toBe('function')
    })

    test('resolve resolves the promise in one cycle', async () => {
        const [promise, resolve] = flatPromise()
        const cb = jest.fn()
        promise.then(cb)
        resolve('foo')
        await Promise.resolve() // Roll mtq
        expect(cb).toHaveBeenCalledWith('foo')
    })
})