import timeout from "../src/timeout"

describe('Waits a given number of miliseconds before resolving', () => {
    test('Resolves roughly the correct amount of miliseconds later', async () => {
        const start = Date.now()
        await timeout(1000)
        const end = Date.now()
        expect(start + 1000).toBeCloseTo(end, -2)
    })
})