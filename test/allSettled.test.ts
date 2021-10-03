import allSettled from "../src/allSettled"
import flatPromise from "../src/core/flatPromise"
import { flatXPromise } from "../src/core/xpromise"

describe('Promise.allSettled for xpromises', () => {
    test('Resolves a promise and an xpromise in all their states', async () => {
        const [prom1, resolve1] = flatPromise<string>()
        const [prom2, _, reject2] = flatPromise<string>()
        const [pled3, resolve3] = flatXPromise<string>()
        const [pled4, _1, reject4] = flatXPromise<string>()
        const [pled5] = flatXPromise<string>()
        resolve1('foo')
        reject2('bar')
        resolve3('baz')
        pled4.catch(() => {}, 'sync')
        reject4('quz')
        pled5.cancel()
        const [res1, res2, res3, res4, res5] = await allSettled([prom1, prom2, pled3, pled4, pled5])
        expect(res1).toEqual({ status: 'fulfilled', value: 'foo' })
        expect(res2).toEqual({ status: 'rejected', reason: 'bar' })
        expect(res3).toEqual({ status: 'fulfilled', value: 'baz' })
        expect(res4).toEqual({ status: 'rejected', reason: 'quz' })
        expect(res5).toEqual({ status: 'cancelled' })
    })
})