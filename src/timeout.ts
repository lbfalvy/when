import { flatXPromise } from "./core/xpromise";
import { XPromise } from "./core/types";

export function timeout(ms: number): XPromise<void> {
    const [p, resolve, _, onCancel] = flatXPromise<void>()
    const to = setTimeout(resolve, ms)
    onCancel(() => clearTimeout(to))
    return p
}