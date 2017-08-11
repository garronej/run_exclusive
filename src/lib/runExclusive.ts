export class ExecQueue {
    public readonly queuedCalls: Function[]=[];
    public isRunning: boolean= false;

    public cancelAllQueuedCalls(): number {
        let n: number;

        this.queuedCalls.splice(0, n=this.queuedCalls.length);

        return n;

    }

}

type ExecQueueByGroup = Record<string, ExecQueue>;

export type ClusterRef= Object | string | number;

const clusters = new Map<ClusterRef, ExecQueueByGroup>();

const generateUniqGroup = (() => {

    let counter = 0;

    return (): string => `zFw3#Te0x-@sR=xElM%dEfKln===${counter++}`;

})();


function getOrCreateExecQueue(clusterRef: ClusterRef, group: string): ExecQueue {

    let execQueueByGroup = clusters.get(clusterRef);

    if (!execQueueByGroup) {
        execQueueByGroup = {};
        clusters.set(clusterRef, execQueueByGroup);
    }

    if (!execQueueByGroup[group])
        execQueueByGroup[group] = new ExecQueue();

    return execQueueByGroup[group];

}

const clusterRefGlobal = [ "GLOBAL CLUSTER REF" ];

export function buildMethod<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export function buildMethod<T extends (...input: any[]) => Promise<any>>(group: string, fun: T): T;
export function buildMethod(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return _build_(undefined, undefined, inputs[0]);
        case 2: return _build_(undefined, inputs[0], inputs[1]);
    }

}

export function build<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export function build<T extends (...input: any[]) => Promise<any>>(group: string, fun: T): T;
export function build(...inputs: any[]): any {

    switch (inputs.length) {
        case 1: return _build_(clusterRefGlobal, undefined, inputs[0]);
        case 2: return _build_(clusterRefGlobal, inputs[0], inputs[1]);
    }

}



const execQueueRefByFunction = new Map<Function, { clusterRefLastCall: ClusterRef, group: string; }>();


export function getQueuedCallCount(
    runExclusiveFunction: Function,
    clusterRef?: ClusterRef
): number {

    return getExecQueue(runExclusiveFunction, clusterRef).queuedCalls.length;

}

export function cancelAllQueuedCalls(
    runExclusiveFunction: Function,
    clusterRef?: ClusterRef
): number {

    return getExecQueue(runExclusiveFunction, clusterRef).cancelAllQueuedCalls();

}

export function isRunning(
    runExclusiveFunction: Function,
    clusterRef?: ClusterRef
): boolean {

    return getExecQueue(runExclusiveFunction, clusterRef).isRunning;

}

function getExecQueue(
    runExclusiveFunction: Function, 
    clusterRef?: ClusterRef
): ExecQueue {

    if (!execQueueRefByFunction.has(runExclusiveFunction))
        throw new Error("This is not a run exclusive function");

    let { clusterRefLastCall, group } = execQueueRefByFunction.get(runExclusiveFunction)!;

    if (clusterRef === undefined) clusterRef = clusterRefLastCall;

    let execQueueByGroup= clusters.get(clusterRef);

    if( !execQueueByGroup ) return new ExecQueue();

    let execQueue= execQueueByGroup[group];

    if( !execQueue ) return new ExecQueue();

    return execQueue;

}


function _build_<T extends (...inputs: any[]) => Promise<any>>(
    clusterRef: ClusterRef | undefined,
    group: string | undefined,
    fun: T
): T {

    if( group === undefined ) group = generateUniqGroup();

    let out = (function (...inputs) {

        let execQueue: ExecQueue;

        if (clusterRef === undefined) {

            execQueue = getOrCreateExecQueue(this, group!);

            execQueueRefByFunction.get(out)!.clusterRefLastCall = this;

        }else{

            execQueue = getOrCreateExecQueue(clusterRef, group!);

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

    if( clusterRef === undefined ){

        let tmpClusterRef= [ "TMP BEFORE FIRST CALL" ];

        execQueueRefByFunction.set(out, {
            "clusterRefLastCall": tmpClusterRef,
            group
        });

        getOrCreateExecQueue(tmpClusterRef, group);

    }else{

        execQueueRefByFunction.set(out, {
            "clusterRefLastCall": clusterRef,
            group
        });

        getOrCreateExecQueue(clusterRef, group);

    }

    return out;

}
