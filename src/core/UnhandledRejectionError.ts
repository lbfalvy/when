export default class UnhandledRejectionError extends Error {
    name = 'UnhandledRejection'
    constructor(reason: any) {
        super(
            'This error originated by rejecting an XPromise which was not handled with .catch().' +
            `The XPromise rejected with the reason "${
                typeof reason == 'object' && 'toString' in reason
                    ? reason.toString()
                    : reason
            }"`
        )
    }
}