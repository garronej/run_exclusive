
class ExecQueue {

    public readonly queuedCalls: Function[]=[];

    public isRunning: boolean= false;

    /*
    Set of run exclusive function that use this execQueue.
    One runExclusive function can be referenced in multiple ExecQueue if it's a method.
    There is only one function in this set if no groupRef have been specified by the user.
    */
    public readonly runExclusiveFunctions= new Set<Function>();

    //TODO: move where it is used.
    public cancelAllQueuedCalls(): number {

        let n: number;

        this.queuedCalls.splice(0, n=this.queuedCalls.length);

        return n;

    }


}


const globalContext: Object = {};

const clusters = new WeakMap<Object, Map<GroupRef,ExecQueue>>();

function getOrCreateExecQueue(
    context: Object, 
    groupRef: GroupRef
): ExecQueue {

    let execQueueByGroup = clusters.get(context);

    if (!execQueueByGroup) {
        execQueueByGroup = new Map();
        clusters.set(context, execQueueByGroup);
    }

    let execQueue= execQueueByGroup.get(groupRef);

    if (!execQueue){
        execQueue= new ExecQueue();
        execQueueByGroup.set(groupRef, execQueue);
    }

    return execQueue;

}

export type GroupRef = never[];

export function createGroupRef(): GroupRef {
    return [];
}

/**
 * Built a run-exclusive function from a function that return a promise.
 */
export function build<T extends (...input: any[]) => Promise<any>>(fun: T): T;
/**
 * Built a run-exclusive function from a function that return a promise.
 * 
 * The group ref parameter is used when in need that two or more different functions do nor run simultaneously.
 * Group refs are created by calling createGroupRef().
 */
export function build<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
export function build(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnPromise(true, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(true, inputs[0], inputs[1]);
    }

}


/** Same as build but to restrict the exclusion to a class instance object. */
export function buildMethod<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export function buildMethod<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
export function buildMethod(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnPromise(false, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(false, inputs[0], inputs[1]);
    }

}

/** 
 * 
 * Get the number of queued call of a run-exclusive function. 
 * Note that if you call a runExclusive function and call this 
 * directly after it will return 0 as there is one function call
 * running but 0 queued.
 * 
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *  
 * */
export function getQueuedCallCount(
    runExclusiveFunction: Function,
    classInstanceObject?: Object
): number {

    const execQueue= getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);

    return execQueue?execQueue.queuedCalls.length:0;

}

/**
 * 
 * Cancel all queued calls of a run-exclusive function.
 * Note that the current running call will not be cancelled.
 * 
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 * 
 */
export function cancelAllQueuedCalls(
    runExclusiveFunction: Function,
    classInstanceObject?: Object
): number {

    const execQueue= getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);

    return execQueue?execQueue.cancelAllQueuedCalls():0;

}

/**
 * Tell if a run-exclusive function has an instance of it's call currently being
 * performed.
 * 
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
export function isRunning(
    runExclusiveFunction: Function,
    classInstanceObject?: Object
): boolean {

    const execQueue= getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);

    return execQueue?execQueue.isRunning:false;

}

function getExecQueueByFunctionAndContext(
    runExclusiveFunction: Function,
    context = globalContext
): ExecQueue | undefined {

    const execQueue = (() => {

        const execQueueByGroup = clusters.get(context);

        if (!execQueueByGroup) {
            return undefined;
        }

        for (const execQueue of execQueueByGroup.values()) {

            if (execQueue.runExclusiveFunctions.has(runExclusiveFunction)) {
                return execQueue;
            }

        }

        return undefined;

    })();

    if( !execQueue && context === globalContext ){

        throw new Error("Function is not run-exclusive");

    }else{

        return execQueue;

    }

}

function buildFnPromise<T extends (...inputs: any[]) => Promise<any>>(
    isGlobal: boolean,
    groupRef: GroupRef,
    fun: T
): T {

    let execQueue: ExecQueue;

    const runExclusiveFunction = (function (...inputs) {

        if (!isGlobal) {

            if (!(this instanceof Object)) {
                throw new Error("Run exclusive, <this> should be an object");
            }

            execQueue = getOrCreateExecQueue(this, groupRef);

            execQueue.runExclusiveFunctions.add(runExclusiveFunction);

        }

        return new Promise<any>((resolve, reject) => {

            const onComplete = (result: { data: any } | { reason: any }) => {

                execQueue.isRunning = false;

                if (execQueue.queuedCalls.length) {
                    execQueue.queuedCalls.shift()!();
                }

                if ("data" in result) {
                    resolve(result.data);
                } else {
                    reject(result.reason);
                }

            };

            (function callee(...inputs) {

                if (execQueue.isRunning) {
                    execQueue.queuedCalls.push(() => callee.apply(this, inputs));
                    return;
                }

                execQueue.isRunning = true;

                try {

                    fun.apply(this, inputs)
                        .then(data => onComplete({ data }))
                        .catch(reason => onComplete({ reason }));

                } catch (error) {

                    onComplete({ "reason": error });

                }

            }).apply(this, inputs);

        });

    }) as T;

    if (isGlobal) {

        execQueue = getOrCreateExecQueue(globalContext, groupRef);

        execQueue.runExclusiveFunctions.add(runExclusiveFunction);

    }

    return runExclusiveFunction;

}

/** 
 * 
 * The pending of 'build' for creating run exclusive functions that complete
 * via calling a callback function. (Instead of returning a promise).
 * 
 * The only valid reason to use this instead of build is to be able to
 * retreave the result of a call synchronously. in the case.
 * 
 * If you want the callback to be optional it is possible to 
 * define the function as such: 
 * 
 * const myRunExclusiveFunction = buildCb((callback?)=> { ... });
 * 
 * But you must call it every time and assume it has been defined:
 * callback!(...);
 * 
 * To see if the user has actually provided a callback you can access
 * callback.hasCallback.
 * 
 * WARNING: the source function should NEVER throw exception!
 * 
 */
export function buildCb<T extends (...input: any[]) => void>(fun: T): T;
export function buildCb<T extends (...input: any[]) => void>(groupRef: GroupRef, fun: T): T;
export function buildCb(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnCallback(true, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(true, inputs[0], inputs[1]);
    }

}

/** 
 * Pending of 'buildMethod' for function that return with callback instead of promise.
 * See buildCb.
 */
export function buildMethodCb<T extends (...input: any[]) => void>(fun: T): T;
export function buildMethodCb<T extends (...input: any[]) => void>(groupRef: GroupRef, fun: T): T;
export function buildMethodCb(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnCallback(false, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(false, inputs[0], inputs[1]);
    }

}

function buildFnCallback<T extends (...inputs: any[]) => Promise<any>>(
    isGlobal: boolean,
    groupRef: GroupRef,
    fun: T
): T {

    let execQueue: ExecQueue;

    const runExclusiveFunction = (function (...inputs) {

        if (!isGlobal) {

            if (!(this instanceof Object)) {
                throw new Error("Run exclusive, <this> should be an object");
            }

            execQueue = getOrCreateExecQueue(this, groupRef);

            execQueue.runExclusiveFunctions.add(runExclusiveFunction);

        }

        let callback: Function | undefined = undefined;

        if (inputs.length && typeof inputs[inputs.length - 1] === "function") {
            callback = inputs.pop();
        }

        const onComplete = (...inputs) => {

            execQueue!.isRunning = false;

            if (execQueue.queuedCalls.length) {
                execQueue.queuedCalls.shift()!();
            }

            if (callback) {
                callback.apply(this, inputs);
            }

        };

        (onComplete as any).hasCallback = !!callback;

        (function callee(...inputs) {

            if (execQueue.isRunning) {
                execQueue.queuedCalls.push(() => callee.apply(this, inputs));
                return;
            }

            execQueue.isRunning = true;

            try {

                fun.apply(this, [...inputs, onComplete]);

            } catch (error) {

                error.message += " ( This exception should not have been thrown, miss use of run-exclusive buildCb )";

                throw error;

            }

        }).apply(this, inputs);

    }) as T;

    if (isGlobal) {

        execQueue = getOrCreateExecQueue(globalContext, groupRef);

        execQueue.runExclusiveFunctions.add(runExclusiveFunction);

    }

    return runExclusiveFunction;

}

