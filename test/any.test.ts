import { any } from "../src/any"
import { flatPromise } from "../src/core/flatPromise"
import { xPromise, flatXPromise } from "../src/core/xpromise"
import { XPromise } from "../src/core/types"

describe('Promise.any but with xpromise support', () => {
    test('resolves with only xpromises', async () => {
        const a = any([
            xPromise<string>(resolve => resolve('foo')),
            xPromise<string>(resolve => resolve('bar'))
        ])
        a.execute()
        expect(a.value).toEqual('foo')
    })
    test('resolves with a string', () => {
        const a = any(['foo'])
        a.execute()
        expect(a.value).toBe('foo')
    })
    describe('mixed argument array of promises and xpromises', () => {
        let promiseResolve: (t: string) => void
        let promiseReject: (e: any) => void
        let promise: Promise<string>
        let xResolve: (t: string) => void
        let xReject: (e: any) => void
        let xpromise: XPromise<string>
        let anyPromise: XPromise<string>

        beforeEach(() => {
            [xpromise, xResolve, xReject] = flatXPromise<string>();
            [promise, promiseResolve, promiseReject] = flatPromise<string>()
            anyPromise = any([promise, xpromise])
            anyPromise.execute() // Necessary to avoid problems with laziness
        })
        test('rejects when xpromise rejects last', async () => {
            anyPromise.catch(() => {})
            promiseReject('foo')
            await Promise.resolve() // Roll mtq
            expect(anyPromise.status).toBe('pending')
            xReject('bar')
            expect(anyPromise.reason).toEqual(['foo', 'bar'])
        })
        test('rejects when promise rejects last', async () => {
            anyPromise.catch(() => {})
            xReject('boo')
            expect(anyPromise.status).toBe('pending')
            promiseReject('far')
            await Promise.resolve()
            expect(anyPromise.reason).toEqual(['far', 'boo'])
        })
        test('Resolves when promise resolves', async () => {
            promiseResolve('booz')
            await Promise.resolve()
            expect(anyPromise.value).toBe('booz')
        })
        test('Resolves when xpromise resolves', async () => {
            xResolve('bizzfuz')
            expect(anyPromise.value).toBe('bizzfuz')
        })
    })
})