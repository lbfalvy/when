export function assertRelay(relay: () => any, target: jest.Mock<any, any>) {
    const invocations = target.mock.calls.length
    relay()
    expect(target).toHaveBeenCalledTimes(invocations + 1)
}