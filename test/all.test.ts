import all from "../src/all"
import flatPromise from "../src/core/flatPromise"
import xPromise, { flatXPromise } from "../src/core/xpromise"
import { XPromise } from "../src/core/types"

describe('Promise.all but with xpromise support', () => {
    test('resolves with only xpromises', async () => {
        const a = all([
            xPromise<string>(resolve => resolve('foo')),
            xPromise<string>(resolve => resolve('bar'))
        ])
        a.execute()
        expect(a.value).toEqual(['foo', 'bar'])
    })
    test('resolves with a concrete string', () => {
        const a = all(['foo'])
        a.execute()
        expect(a.value).toEqual(['foo'])
    })
    describe('mixed argument array of promises and xpromises', () => {
        let promiseResolve: (t: string) => void
        let promiseReject: (e: any) => void
        let promise: Promise<string>
        let xResolve: (t: string) => void
        let xReject: (e: any) => void
        let xPromise: XPromise<string>
        let allPromise: XPromise<[string, string]>

        beforeEach(() => {
            [xPromise, xResolve, xReject] = flatXPromise<string>();
            [promise, promiseResolve, promiseReject] = flatPromise<string>()
            allPromise = all([promise, xPromise])
            allPromise.execute()
        })
        test('resolves when xpromise resolves last', async () => {
            promiseResolve('foo')
            await Promise.resolve() // Roll mtq
            expect(allPromise.status).toBe('pending')
            xResolve('bar')
            expect(allPromise.value).toEqual(['foo', 'bar'])
        })
        test('resolves when promise resolves last', async () => {
            xResolve('boo')
            expect(allPromise.status).toBe('pending')
            promiseResolve('far')
            await Promise.resolve()
            expect(allPromise.value).toEqual(['far', 'boo'])
        })
        test('Rejects when promise rejects', async () => {
            allPromise.catch(() => {})
            promiseReject('booz')
            await Promise.resolve()
            expect(allPromise.reason).toBe('booz')
        })
        test('Rejects when xpromise rejects', () => {
            allPromise.catch(() => {}, 'sync')
            xPromise.catch(() => {}, 'sync')
            xReject('bizzfuz')
            expect(allPromise.reason).toBe('bizzfuz')
        })
    })
})