import all from "./all"
import allSettled from "./allSettled"
import callback from "./callback"
import xPromise, { eagerXPromise, flatXPromise } from "./core/xpromise"
import { XPromise } from "./core/types"
import event from "./event"
import race from "./race"
import timeout from "./timeout"
import { tap } from "./tap"
import { Thenable } from "./Thenable"
import isXPromise from "./core/isXPromise"
import when from "./when"
import { cancel, reject, resolve } from "./primitives"

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