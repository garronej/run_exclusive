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

const clusters= new Map<Object, ExecQueueByGroup>();

function getQueue(clusterRef: Object, group: string | undefined): ExecQueue {

    let execQueueByGroup= clusters.get(clusterRef);

    if (!execQueueByGroup) {
        execQueueByGroup = {};
        clusters.set(clusterRef, execQueueByGroup );
    }

    if (group === undefined)
        group = "_" + Object.keys(execQueueByGroup).join("");

    if (!execQueueByGroup[group])
        execQueueByGroup[group] = new ExecQueue();


    return execQueueByGroup[group];

}


export function execQueue<T extends (...inputs: any[]) => any>(fun: T): T & ExecQueue;
export function execQueue<T extends (...inputs: any[]) => any>(group: string, fun: T): T & ExecQueue;
export function execQueue<T extends (...inputs: any[]) => any>(cluster: Object, group: string, fun: T): T & ExecQueue;
export function execQueue(...inputs: any[]): any {

    switch (inputs.length) {
        case 1:
            return __execQueue__.apply(null, [undefined, undefined].concat(inputs));
        case 2:
            return __execQueue__.apply(null, [undefined].concat(inputs));
        case 3:
            return __execQueue__.apply(null, inputs);
    }

}

function __execQueue__<T extends (...inputs: any[]) => void>(
    cluster: Object | undefined,
    group: string | undefined,
    fun: T
): T & ExecQueue {

    let execQueue: ExecQueue | undefined = undefined;

    let out: any = function (...inputs) {

        if (!execQueue)
            execQueue = getQueue(cluster || this, group);

        let callback: Function | undefined= undefined;

        if( inputs.length && typeof inputs[inputs.length-1] === "function" )
            callback= inputs.pop();


        return new Promise<any>(resolve => {

            let execQueueCallback: any = (...inputs) => {

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

            execQueueCallback.hasCallback = (callback) ? true : false;

            (function callee(...inputs) {

                if (execQueue!.isRunning) {
                    execQueue!.queuedCalls.push(() => callee.apply(this, inputs));
                    return;
                }

                execQueue!.isRunning = true;


                fun.apply(this, [...inputs, execQueueCallback]);

            }).apply(this, inputs);

        });

    }

    Object.defineProperties(out, {
        "queuedCalls": {
            get() {
                if (!execQueue) return [];
                else return execQueue.queuedCalls;
            }
        },
        "isRunning": {
            get() {
                if (!execQueue) return false;
                else return execQueue.isRunning;
            },
            set(isRunning) {
                if (!execQueue) return;
                execQueue.isRunning = isRunning;
            }
        },
        "cancelAllQueuedCalls": {
            value() {
                if (!execQueue) return 0;
                return execQueue.cancelAllQueuedCalls();
            }
        }
    });

    return out as T & ExecQueue;

}
