import race from "../src/race"
import flatPromise from "../src/core/flatPromise"
import xPromise, { flatXPromise } from "../src/core/xpromise"
import { XPromise } from "../src/core/types"

describe('Promise.race but with xpromise support', () => {
    test('resolves with only xpromises', async () => {
        const a = race([
            xPromise<string>(resolve => resolve('foo')),
            xPromise<string>(resolve => resolve('bar'))
        ])
        a.then(null, null, 'sync')
        expect(a.status).toBe('fulfilled')
        expect(a.value).toEqual('foo')
    })
    describe('mixed argument array of promises and xpromises', () => {
        let promiseResolve: (t: string) => void
        let promiseReject: (e: any) => void
        let promise: Promise<string>
        let xResolve: (t: string) => void
        let xReject: (e: any) => void
        let xpromise: XPromise<string>
        let racePromise: XPromise<[string, string]>

        beforeEach(() => {
            [xpromise, xResolve, xReject] = flatXPromise<string>();
            [promise, promiseResolve, promiseReject] = flatPromise<string>()
            racePromise = race([promise, xpromise])
            racePromise.then(null, null, 'sync') // Necessary to avoid problems with laziness
        })
        test('rejects when xpromise rejects last', async () => {
            racePromise.catch(() => {})
            promiseReject('foo')
            await Promise.resolve() // Roll mtq
            expect(racePromise.status).toBe('pending')
            xReject('bar')
            expect(racePromise.status).toBe('rejected')
            expect(racePromise.reason).toEqual(['foo', 'bar'])
        })
        test('rejects when promise rejects last', async () => {
            racePromise.catch(() => {})
            xReject('boo')
            expect(racePromise.status).toBe('pending')
            promiseReject('far')
            await Promise.resolve()
            expect(racePromise.status).toBe('rejected')
            expect(racePromise.reason).toEqual(['far', 'boo'])
        })
        test('Resolves when promise resolves', async () => {
            promiseResolve('booz')
            await Promise.resolve()
            expect(racePromise.status).toBe('fulfilled')
            expect(racePromise.value).toBe('booz')
        })
        test('Resolves when xpromise resolves', async () => {
            xResolve('bizzfuz')
            expect(racePromise.status).toBe('fulfilled')
            expect(racePromise.value).toBe('bizzfuz')
        })
    })
})