import { runHandler } from "../../src/core/runHandler"

describe('Executes a handler and triggers resolve/reject appropriately', () => {
    test('Relays the argument to the handler', () => {
        const handler = jest.fn()
        runHandler(handler, 'foo', () => {}, () => {})
        expect(handler).toHaveBeenCalledWith('foo')
    })
    test('Resolves if nothing was returned', () => {
        const resolve = jest.fn()
        const reject = jest.fn()
        runHandler(() => {}, null, resolve, reject)
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith(undefined)
        expect(reject).not.toHaveBeenCalled()
    })
    test('Resolves with the result in the simple case', () => {
        const resolve = jest.fn()
        const reject = jest.fn()
        runHandler(() => 'foo', null, resolve, reject)
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenLastCalledWith('foo')
        expect(reject).not.toHaveBeenCalled()
    })
    test('Rejects with the exception in the simple case', () => {
        const resolve = jest.fn()
        const reject = jest.fn()
        runHandler(() => { throw 'foo' }, null, resolve, reject)
        expect(resolve).not.toHaveBeenCalled()
        expect(reject).toHaveBeenCalledTimes(1)
        expect(reject).toHaveBeenLastCalledWith('foo')
    })
    test('Passes resolve and reject to xpromise', () => {
        const resolve = () => {}
        const reject = () => {}
        const cancel = jest.fn()
        const then = jest.fn()
        // Although the current implementation works without it, all xpromises are promises
        // and this is an assumption the implementation is allowed to make.
        const mock = Object.assign(new Promise(() => {}), {
            typeid: 'XPromise',
            then, cancel
        })
        const ccfn = runHandler(() => mock, null, resolve, reject)
        expect(then).toHaveBeenCalledWith(resolve, reject, 'sync')
        // These are technically equal for now but all we ask is for the returned function
        // to invoke cancel.
        ccfn()
        expect(cancel).toHaveBeenCalled()
    })
    test('Passes resolve and reject to promise without sync', () => {
        const resolve = () => {}
        const reject = () => {}
        const then = jest.fn()
        const mock = Object.assign(new Promise(() => {}), { then })
        runHandler(() => mock, null, resolve, reject)
        expect(then).toHaveBeenCalledWith(resolve, reject)
    })
})