import { when } from '../src/index'

describe('Wrapper function', () => {
    test('detects timeout', () => {
        expect(when(1000)).resolves.toBe(undefined)
    })
    test('detects flat', () => {
        expect(when()).toHaveLength(4)
    })
    test('detects promise', () => {
        expect(when(Promise.resolve('foo'))).resolves.toBe('foo')
    })
    test('detects executor', () => {
        expect(when(res => res('foo'))).resolves.toBe('foo')
    })
    test('detects event', () => {
        const addListener = jest.fn()
        const tgt = { addListener, removeListener: () => {} }
        when(tgt, 'foo')
        expect(addListener).toHaveBeenCalled()
    })
    test('throws otherwise', () => {
        const _when = when as (...args: any[]) => any
        expect(() => _when('incorrect parameter')).toThrow()
    })
})