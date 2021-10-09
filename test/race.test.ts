import { xPromise } from "../src/core/xpromise"
import { reject, resolve } from "../src/primitives"
import { race } from "../src/race"

describe('Promise.race but with xpromise support', () => {
    test('resolves with the first', () => {
        const a = race([
            resolve('foo'),
            xPromise<string>(() => {})
        ])
        a.execute()
        expect(a.value).toEqual('foo')
    })
    test('resolves with the first to reject', () => {
        const a = race([
            xPromise<string>(() => {}),
            reject('foo')
        ])
        a.execute()
        expect(a.value).toEqual('foo')
    })
})