import { all } from "./all"
import { allSettled } from "./allSettled"
import { callback } from "./callback"
import { isXPromise } from "./core/isXPromise"
import { XPromise } from "./core/types"
import { xPromise, eagerXPromise, flatXPromise } from "./core/xpromise"
import { event } from "./event"
import { cancel, reject, resolve } from "./primitives"
import { race } from "./race"
import { tap } from "./tap"
import { Thenable } from "./Thenable"
import { timeout } from "./timeout"
import { when } from "./when"

export {
    when,
    eagerXPromise as eager,
    flatXPromise as flat,
    callback,
    xPromise as xpromise,
    event,
    tap, timeout, 
    all, race, allSettled,
    resolve, reject, cancel,
    isXPromise,
    Thenable, XPromise,
}