export declare type GroupRef = never[];
export declare function createGroupRef(): GroupRef;
/**
 * Built a run-exclusive function from a function that return a promise.
 */
export declare function build<T extends (...input: any[]) => Promise<any>>(fun: T): T;
/**
 * Built a run-exclusive function from a function that return a promise.
 *
 * The group ref parameter is used when in need that two or more different functions do nor run simultaneously.
 * Group refs are created by calling createGroupRef().
 */
export declare function build<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
/** Same as build but to restrict the exclusion to a class instance object. */
export declare function buildMethod<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export declare function buildMethod<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
/**
 *
 * Get the number of queued call of a run-exclusive function.
 * Note that if you call a runExclusive function and call this
 * directly after it will return 0 as there is one function call
 * execution ongoing but 0 queued.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *
 * */
export declare function getQueuedCallCount(runExclusiveFunction: Function, classInstanceObject?: Object): number;
/**
 *
 * Cancel all queued calls of a run-exclusive function.
 * Note that the current running call will not be cancelled.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *
 */
export declare function cancelAllQueuedCalls(runExclusiveFunction: Function, classInstanceObject?: Object): number;
/**
 * Tell if a run-exclusive function has an instance of it's call currently being
 * performed.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
export declare function isRunning(runExclusiveFunction: Function, classInstanceObject?: Object): boolean;
/**
 * Return a promise that resolve when all the current queued call of a runExclusive functions
 * have completed.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
export declare function getPrComplete(runExclusiveFunction: Function, classInstanceObject?: Object): Promise<void>;
/**
 * (Read all before using)
 *
 * The pending of 'build' for creating run exclusive functions that complete
 * via calling a callback function. (Instead of returning a promise).
 *
 * The only valid reason to use this instead of ``build()`` is to be able to
 * retrieve the result and/or release the lock synchronously when it's possible.
 *
 * If you want the callback to be optional it is possible to
 * define the function as such:
 * ``const myRunExclusiveFunction = buildCb((callback?)=> { ... });``
 * Anyway you must call it every time and assume it has been defined:
 * ``callback!(...)``.
 *
 * To see if the user has actually provided a callback you can access the hidden property
 * ``callback.hasCallback``.
 *
 * WARNING: You must also make sure, if you use an optional callback
 * that the argument before it cannot be a function.
 * Be aware that the compiler won't warn you against it.
 * Example: ``(getLetter:()=> string, callback?:(res:string)=> void)=>{..}``
 * is NOT a valid function to pass to ``buildCb()``
 *
 * WARNING: the source function should NEVER throw exception!
 */
export declare function buildCb<T extends (...input: any[]) => void>(fun: T): T;
export declare function buildCb<T extends (...input: any[]) => void>(groupRef: GroupRef, fun: T): T;
/**
 * (Read all before using)
 *
 * Pending of 'buildMethod' for function that return with callback instead of promise.
 *
 * The pending of 'build' for creating run exclusive functions that complete
 * via calling a callback function. (Instead of returning a promise).
 *
 * The only valid reason to use this instead of ``build()`` is to be able to
 * retrieve the result and/or release the lock synchronously when it's possible.
 *
 * If you want the callback to be optional it is possible to
 * define the function as such:
 * ``const myRunExclusiveFunction = buildCb((callback?)=> { ... });``
 * Anyway you must call it every time and assume it has been defined:
 * ``callback!(...)``.
 *
 * To see if the user has actually provided a callback you can access the hidden property
 * ``callback.hasCallback``.
 *
 * WARNING: You must also make sure, if you use an optional callback
 * that the argument before it cannot be a function.
 * Be aware that the compiler won't warn you against it.
 * Example: ``(getLetter:()=> string, callback?:(res:string)=> void)=>{..}``
 * is NOT a valid function to pass to ``buildMethodCb()``
 *
 * WARNING: the source function should NEVER throw exception!
 *
 */
export declare function buildMethodCb<T extends (...input: any[]) => void>(fun: T): T;
export declare function buildMethodCb<T extends (...input: any[]) => void>(groupRef: GroupRef, fun: T): T;
