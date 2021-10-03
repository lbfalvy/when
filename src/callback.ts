import xPromise from "./core/xpromise";
import { XPromise } from "./core/types";

export default function callback<T, Argv extends any[]>(
    f: (...args: [...Argv, (e: any, res: T) => void]) => any,
    ...args: Argv
): XPromise<T> {
    return xPromise((resolve, reject) => {
        f(...args, (e: any, res: T) => {
            if (e) reject(e)
            else resolve(res)
        })
    })
} 