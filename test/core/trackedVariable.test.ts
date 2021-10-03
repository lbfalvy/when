import trackedVariable from "../../src/core/trackedVariable"

describe('A reference, a setter and a change signal', () => {
    test('its value should update with the set call', () => {
        const [ref, onChange, set] = trackedVariable('foo')
        expect(ref[0]).toBe('foo')
        set('bar')
        expect(ref[0]).toBe('bar')
    })
    test('it should trigger onChange callbacks', () => {
        const [ref, onChange, set] = trackedVariable('foo')
        const cb = jest.fn()
        const release = onChange(cb)
        set('bar')
        expect(cb).toHaveBeenCalledTimes(1)
        expect(cb).toHaveBeenLastCalledWith('bar', 'foo')
        set('baz')
        expect(cb).toHaveBeenCalledTimes(2)
        expect(cb).toHaveBeenLastCalledWith('baz', 'bar')
        release()
        set('quz')
        expect(cb).toHaveBeenCalledTimes(2)
    })
    test('assigning the same handler multiple times works as expected', () => {
        const [ref, onChange, set] = trackedVariable('foo')
        const cb = jest.fn()
        const release1 = onChange(cb)
        const release2 = onChange(cb)
        set('bar')
        expect(cb).toHaveBeenCalledTimes(2)
        release2()
        set('baz')
        expect(cb).toHaveBeenCalledTimes(3)
        release1()
        set('quz')
        expect(cb).toHaveBeenCalledTimes(3)
    })
})