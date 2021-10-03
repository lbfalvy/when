import callback from "../src/callback"

describe('Promisifies Node-style callback interfaces', () => {
    test('resolve path', () => {
        const f = jest.fn()
        const promise = callback(f, 'foo', 'bar')
        promise.then()
        expect(f).toHaveBeenCalledTimes(1)
        const args = f.mock.calls[0] as any[]
        const cb = args.pop()
        expect(args).toEqual(['foo', 'bar'])
        cb(null, 'foo')
        expect(promise.status).toBe('fulfilled')
        expect(promise.value).toBe('foo')
    })

    test('reject path', () => {
        const f = jest.fn()
        const promise = callback(f, 'foo', 'bar')
        promise.catch(() => {})
        expect(f).toHaveBeenCalledTimes(1)
        const args = f.mock.calls[0] as any[]
        const cb = args.pop()
        expect(args).toEqual(['foo', 'bar'])
        cb('foo')
        expect(promise.status).toBe('rejected')
        expect(promise.reason).toBe('foo')
    })

    test('is lazy', () => {
        const f = jest.fn()
        callback(f, 'foo', 'bar')
        expect(f).not.toHaveBeenCalled()
    })
})