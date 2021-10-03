# When
The core API mimics the promise API, but it has a couple extensions.

## Lazy
By default all promises in `when` are lazy, that is, the executor doesn't run until the first `then` call. This can save you bandwidth or other resources and it allows you to space out your network requests without the help of a separate data fetching library. If you need an eager promise, use `when.eager`. If the executor has side effects, consider using the [[#Exposed]] form instead.

## Synchronous mode
`then` has a third optionsl argument, which is the string 'sync'. If this is present, both fulfill and reject handlers will be called synchronously. Use this sparingly, timing sensitivity is generally not a good thing. Catch and finally both also have this argument.

```ts
promise.then(result => {}, err => {}, 'sync')
```

## Cancelable promises
The executor can return a function which will be called on cancellation.

```ts
const promise = when((resolve, reject) => {
	const request = someComplicatedProcess()
	request.on('complete', data => resolve(data))
	request.on('error', err => reject(err))
	return () => request.cancel()
})
```

The promises returned by when() have a cancel function, which can be called to invoke this particular executor's cancel handler.

```ts
promise.cancel()
```

`cancel` can also be passed a callback that will receive cancel itself. This is so that you can embed it in promise chains.

```ts
// cancelation with mini-events
const [cancel, addCancel] = event()
longOperation()
	.cancel(addCancel)
	.then(result => {}, err => {})
```

```ts
// It is really just a function, you can do with it whatever you want.
const cbs = new Set<() => void>
const addCB = cb => cbs.add(cb)
let cancel = cbs.forEach(f => f())
promise.cancel(addCB).then(result => {}, err => {})
```

```ts
// The possibilities are endless
promise.cancel(when(2000).then).then(result => {}, err => {})
```

```ts
// A good use case may be to connect to the first available of several servers.
const promises = ['server1', 'server2', 'server3'].map(tryConnect)
const either = when.race(promises)
promises.forEach(p => p.cancel(either.then))
```

Cancellation is never propagated on the Promise chain, only the last executor's canceller is invoked. Result handlers are also not invoked, because if you cancel a promise you likely control all of its handlers.

## Readable state
The state is indicated on the instance and the return value can be synchronously obtained.

```js
promise.state == 'fulfilled'|'rejected'|'pending'|'cancelled'
promise.value == ...
promise.error == ...
promise.settle // getter returns another promise
```

## Exposed
If an executor is not provided, the factory returns its parameters in a tuple with the instance. In this case, cancelation is represented as a subscribe function.

```ts
const [promise, resolve, reject, cancelation] = when()
```

## Promise wrapper
If you pass a thenable to `when` with no parameters, it is wrapped in a when-promise.

```ts
const promise = when(fetch('foo.png'))
```

## Timer
If the executor is replaced with a number, the promise will resolve after as many milliseconds.

```ts
// Wait 1 second
await when(1000)
```

## Events
If `when` is called with an object and one or two event names, it attaches resolve and reject to the events. The following pairs of functions are looked up on the object, and the first to exist is used as it would normally be used in its corresponding environment to attach and detach handlers.

- `addEventListener`/`removeEventListener` (browser)
- `addListener`/`removeListener` (node)
- `on`/`off` (concise node)

If none are found, an error is thrown.

```ts
const clickEvent = when(document.getElementById('mybtn'), 'click')
```

## Callbacks
To promisify standard node callbacks where the first argument is error and the second is the result, you can pass the function and its arguments to `when.cb`

```ts
const settings = await when.cb(readFile, './settings.json')
```

## Tapped function calls
Detect when a function is called. Useful if you need to observe behavior for which an event is not provided. *Note that this is capable of violating the interface of whatever object you're using it on. Be very careful and always double-check if what you're tapping into can be accessed in some other, legitimate way.*

`when.tap` takes an object and one or two indices, and assigns handlers to the indices. It returns a thenable which is resolved when the first or rejected when the second index is called.

When the promise is settled, the indices are reset to their previous value. If they contained a function and the reason for disengagement was a call rather than cancellation, the call is relayed to that function.

```ts
const firstMessage = await when.tap(port, 'postMessage', 'close')
```

## Aggregators, defaults
All the capabilities of `when` are available with the classic promise helpers.

```ts
when.resolve(data) // Promise.resolve
when.reject(error) // Promise.reject
when.cancel()
when.all([new Promise(), when(foo)]) // Promise.all
when.race([new Promise(), when(foo)]) // Promise.race
when.allSettled([new Promise(), when(foo)]) // Promise.allSettled
```