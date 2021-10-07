import { flatXPromise } from "./core/xpromise";
import { XPromise } from "./core/types";

/**
 * Intended to find the names of all handlers on T (typically of shape /on.\*\/)
 */
type FunctionProp<T> = {
    [P in keyof T]: ((...args: any[]) => any) extends T[P] ? P : never
}[keyof T];

/**
 * Matches any object where [Key] is a nullable function
 */
type FunctionHost<Key extends string | number | symbol> = {
    [P in Key]: ((...args: any[]) => any) | null
}

/**
 * Returns a promise that resolves when the specified method is called
 * @param object The object the method is on
 * @param index Name of the handler to hook onto
 * @param err Error handler, if specified, the promise will reject when called
 */
export function tap<T, Key extends FunctionProp<T>, ErrKey extends FunctionProp<T>>(
    object: T, index: FunctionProp<T> & Key, err?: FunctionProp<T> & ErrKey
): XPromise<Parameters<T[Key]>> {
    const obj = object as FunctionHost<Key> & FunctionHost<ErrKey>;
    let oldErr: T[ErrKey]
    const [promise, resolve, reject, onCancel] = flatXPromise<Parameters<T[Key]>>()
    const cleanup = () => {
        obj[index] = oldIndex;
        if (err) obj[err] = oldErr;
    };
    onCancel(cleanup)
    const oldIndex = object[index as Key]
    obj[index] = (...args: Parameters<T[Key]>) => {
        cleanup();
        resolve(args);
        if (typeof oldIndex == 'function')
            return oldIndex(...args)
    };
    if (err) {
        oldErr = object[err]
        obj[err] = (...args: any[]) => {
            cleanup();
            reject(args);
            if (typeof oldErr == 'function')
                return oldErr(...args)
        };
    }
    return promise
}