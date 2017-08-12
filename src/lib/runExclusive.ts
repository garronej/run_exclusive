export class ExecQueue {
    public readonly queuedCalls: Function[]=[];
    public isRunning: boolean= false;

    public cancelAllQueuedCalls(): number {
        let n: number;

        this.queuedCalls.splice(0, n=this.queuedCalls.length);

        return n;

    }

}


export type GroupRef = never[];
export type ClusterRef= Object | string;

const clusters = new Map<ClusterRef, Map<GroupRef,ExecQueue>>();

function getOrCreateExecQueue(
    clusterRef: ClusterRef, 
    groupRef: GroupRef
): ExecQueue {

    let execQueueByGroup = clusters.get(clusterRef);

    if (!execQueueByGroup) {
        execQueueByGroup = new Map();
        clusters.set(clusterRef, execQueueByGroup);
    }

    let execQueue= execQueueByGroup.get(groupRef);

    if (!execQueue){
        execQueue= new ExecQueue();
        execQueueByGroup.set(groupRef, execQueue);
    }

    return execQueue;

}

export function createGroupRef(): GroupRef {
    return [];
}

const clusterRefGlobal = [ "GLOBAL_CLUSTER_REF" ];

export function buildMethod<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export function buildMethod<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
export function buildMethod(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnPromise(undefined, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(undefined, inputs[0], inputs[1]);
    }

}


export function build<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export function build<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
export function build(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnPromise(clusterRefGlobal, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(clusterRefGlobal, inputs[0], inputs[1]);
    }

}


export function getQueuedCallCount(
    runExclusiveFunction: Function,
    clusterRef?: ClusterRef
): number {

    let execQueue= getExecQueueFromFunction(runExclusiveFunction, clusterRef);

    return execQueue?execQueue.queuedCalls.length:0;

}

export function cancelAllQueuedCalls(
    runExclusiveFunction: Function,
    clusterRef?: ClusterRef
): number {

    let execQueue= getExecQueueFromFunction(runExclusiveFunction, clusterRef);

    return execQueue?execQueue.cancelAllQueuedCalls():0;

}

export function isRunning(
    runExclusiveFunction: Function,
    clusterRef?: ClusterRef
): boolean {

    let execQueue= getExecQueueFromFunction(runExclusiveFunction, clusterRef);

    return execQueue?execQueue.isRunning:false;

}

const execQueueRefByFunction = new Map<Function, { clusterRefLastCall: ClusterRef | undefined, groupRef: GroupRef; }>();

function getExecQueueFromFunction(
    runExclusiveFunction: Function, 
    clusterRef?: ClusterRef
): ExecQueue | undefined {

    if (!execQueueRefByFunction.has(runExclusiveFunction))
        throw new Error("This is not a run exclusive function");

    let { clusterRefLastCall, groupRef } = execQueueRefByFunction.get(runExclusiveFunction)!;

    if (clusterRef === undefined){
        
        if( clusterRefLastCall === undefined ) return undefined;

        clusterRef = clusterRefLastCall;

    }

    let execQueueByGroup= clusters.get(clusterRef);

    if( !execQueueByGroup ) return undefined;

    let execQueue= execQueueByGroup.get(groupRef);

    if( !execQueue ) return undefined;

    return execQueue;

}


function buildFnPromise<T extends (...inputs: any[]) => Promise<any>>(
    clusterRef: ClusterRef | undefined,
    groupRef: GroupRef,
    fun: T
): T {

    let out = (function (...inputs) {

        let execQueue: ExecQueue;

        if (clusterRef === undefined) {

            execQueue = getOrCreateExecQueue(this, groupRef);

            execQueueRefByFunction.get(out)!.clusterRefLastCall = this;

        }else{

            execQueue = getOrCreateExecQueue(clusterRef, groupRef);

        }

        return new Promise<any>((resolve, reject) => {

            let onComplete = (result: { data: any } | { reason: any }) => {

                execQueue!.isRunning = false;

                if (execQueue!.queuedCalls.length)
                    execQueue!.queuedCalls.shift()!();

                if ("data" in result) resolve(result["data"]);
                else reject(result["reason"]);

            };

            (function callee(...inputs) {

                if (execQueue!.isRunning) {
                    execQueue!.queuedCalls.push(() => callee.apply(this, inputs));
                    return;
                }

                execQueue!.isRunning = true;

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

    execQueueRefByFunction.set(out, {
        "clusterRefLastCall": (clusterRef === undefined) ? undefined : clusterRef,
        groupRef
    });

    return out;

}




export function buildMethodCb<T extends (...input: any[]) => any>(fun: T): T;
export function buildMethodCb<T extends (...input: any[]) => any>(groupRef: GroupRef, fun: T): T;
export function buildMethodCb(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnCallback(undefined, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(undefined, inputs[0], inputs[1]);
    }

}


export function buildCb<T extends (...input: any[]) => any>(fun: T): T;
export function buildCb<T extends (...input: any[]) => any>(groupRef: GroupRef, fun: T): T;
export function buildCb(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return buildFnCallback(clusterRefGlobal, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(clusterRefGlobal, inputs[0], inputs[1]);
    }

}


function buildFnCallback<T extends (...inputs: any[]) => Promise<any>>(
    clusterRef: ClusterRef | undefined,
    groupRef: GroupRef,
    fun: T
): T {

    let out = (function (...inputs) {

        let execQueue: ExecQueue;

        if (clusterRef === undefined) {

            execQueue = getOrCreateExecQueue(this, groupRef);

            execQueueRefByFunction.get(out)!.clusterRefLastCall = this;

        }else{

            execQueue = getOrCreateExecQueue(clusterRef, groupRef);

        }

        let callback: Function | undefined= undefined;

        if( inputs.length && typeof inputs[inputs.length-1] === "function" )
            callback= inputs.pop();

        return new Promise<any>((resolve, reject) => {

            let onComplete = (...inputs) => {

                execQueue!.isRunning = false;

                if (execQueue!.queuedCalls.length)
                    execQueue!.queuedCalls.shift()!();

                if (callback)
                    callback.apply(this, inputs);

                switch( inputs.length ){
                    case 0: resolve(); break;
                    case 1: resolve(inputs[0]); break;
                    default: resolve(inputs);
                }


            };

            (onComplete as any).hasCallback = (callback) ? true : false;

            (function callee(...inputs) {

                if (execQueue!.isRunning) {
                    execQueue!.queuedCalls.push(() => callee.apply(this, inputs));
                    return;
                }

                execQueue!.isRunning = true;

                try {

                    fun.apply(this, [...inputs, onComplete]);

                } catch (error) {

                    reject(error);

                }

            }).apply(this, inputs);

        });

    }) as T;

    execQueueRefByFunction.set(out, {
        "clusterRefLastCall": (clusterRef === undefined) ? undefined : clusterRef,
        groupRef
    });

    return out;

}

