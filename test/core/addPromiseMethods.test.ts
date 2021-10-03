import addPromiseMethods from "../../src/core/addPromiseMethods"
import { XPromise } from "../../src/core/types"
import { assertRelay } from "./utils"

describe('Adds all methods to an xpromise that rely on then and an external cancel', () => {
    let then!: jest.Mock<any, any>
    let cancel!: jest.Mock<any, any>
    let p!: XPromise<any>

    beforeEach(() => {
        then = jest.fn()
        cancel = jest.fn()
        p = addPromiseMethods({
            then
        } as any as XPromise<any>, cancel)
    })

    test('assigns toString tag and typeid', () => {
        expect(p.typeid).toBe('XPromise')
    })

    test('catch calls then appropriately', () => {
        const cb = jest.fn()
        p.catch(cb)
        const args = then.mock.calls[0]
        expect(args[0]).toBe(undefined)
        assertRelay(args[1], cb)
    })

    test('catch relays sync', () => {
        const cb = jest.fn()
        p.catch(cb, 'sync')
        expect(then.mock.calls[0][2]).toBe('sync')
    })

    test('finally calls then appropriately', () => {
        const cb = jest.fn()
        p.finally(cb)
        const args = then.mock.calls[0]
        assertRelay(args[0], cb)
        assertRelay(args[1], cb)
    })

    test('finally relays sync', () => {
        const cb = jest.fn()
        p.finally(cb, 'sync')
        expect(then.mock.calls[0][2]).toBe('sync')
    })

    test('cancel relays', () => {
        assertRelay(p.cancel, cancel)
    })

    test('cancel passes a relay to its argument', () => {
        const cb = jest.fn()
        p.cancel(cb)
        assertRelay(cb.mock.calls[0][0], cancel)
    })
})