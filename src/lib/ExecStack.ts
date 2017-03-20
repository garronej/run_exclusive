import { TrackableMap } from "trackable-map";

export class ExecStack {
    public readonly queuedCalls: Function[]=[];
    public isRunning: boolean= false;

    public cancelAllQueuedCalls(): number {
        let n: number;

        this.queuedCalls.splice(0, n=this.queuedCalls.length);

        return n;

    }

}


type ExecStackByGroup = Record<string, ExecStack>;

const clusters= new TrackableMap<Object, ExecStackByGroup>();

function getStack(clusterRef: Object, group: string | undefined): ExecStack {

    let execStackByGroup= clusters.get(clusterRef);

    if (!execStackByGroup) {
        execStackByGroup = {};
        clusters.set(clusterRef, execStackByGroup );
    }

    if (group === undefined)
        group = "_" + Object.keys(execStackByGroup).join("");

    if (!execStackByGroup[group])
        execStackByGroup[group] = new ExecStack();


    return execStackByGroup[group];

}


export function execStack<T extends (...inputs: any[]) => any>(fun: T): T & ExecStack;
export function execStack<T extends (...inputs: any[]) => any>(group: string, fun: T): T & ExecStack;
export function execStack<T extends (...inputs: any[]) => any>(cluster: Object, group: string, fun: T): T & ExecStack;
export function execStack(...inputs: any[]): any {

    switch (inputs.length) {
        case 1:
            return __execStack__.apply(null, [undefined, undefined].concat(inputs));
        case 2:
            return __execStack__.apply(null, [undefined].concat(inputs));
        case 3:
            return __execStack__.apply(null, inputs);
    }

}

function __execStack__<T extends (...inputs: any[]) => void>(
    cluster: Object | undefined,
    group: string | undefined,
    fun: T
): T & ExecStack {

    let execStack: ExecStack | undefined = undefined;

    let out: any = function (...inputs) {

        if (!execStack)
            execStack = getStack(cluster || this, group);

        let callback = inputs.pop();
        if (typeof (callback) !== "function") {
            if (callback !== undefined)
                inputs.push(callback);

            callback = undefined;
        }

        return new Promise<any>(resolve => {

            let execStackCallback: any = (...inputs) => {

                execStack!.isRunning = false;

                if (execStack!.queuedCalls.length)
                    execStack!.queuedCalls.shift()!();

                if (callback)
                    callback.apply(this, inputs);

                switch( inputs.length ){
                    case 0: resolve(); break;
                    case 1: resolve(inputs[0]); break;
                    default: resolve(inputs);
                }

            };

            execStackCallback.hasCallback = (callback) ? true : false;

            (function callee(...inputs) {

                if (execStack!.isRunning) {
                    execStack!.queuedCalls.push(() => callee.apply(this, inputs));
                    return;
                }

                execStack!.isRunning = true;


                fun.apply(this, [...inputs, execStackCallback]);

            }).apply(this, inputs);

        });

    }

    Object.defineProperties(out, {
        "queuedCalls": {
            get() {
                if (!execStack) return [];
                else return execStack.queuedCalls;
            }
        },
        "isRunning": {
            get() {
                if (!execStack) return false;
                else return execStack.isRunning;
            },
            set(isRunning) {
                if (!execStack) return;
                execStack.isRunning = isRunning;
            }
        },
        "cancelAllQueuedCalls": {
            value() {
                if (!execStack) return 0;
                return execStack.cancelAllQueuedCalls();
            }
        }
    });

    return out as T & ExecStack;

}
