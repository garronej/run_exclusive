export interface ExecStack {
    queuedCalls: Function[];
    isRunning: boolean;
    cancelAllQueuedCalls: ()=> number;
}

function initExecStack(): ExecStack{

    let queuedCalls= [];

    return {
        "queuedCalls": queuedCalls,
        "isRunning": false,
        "cancelAllQueuedCalls": ()=> {

            let n: number;

            queuedCalls.splice(0, n=queuedCalls.length);

            return n;
            
        }
    };

}


type ExecStackByGroup = Record<string, ExecStack>;

let clusters: {
    ref: Object;
    execStackByGroup: ExecStackByGroup;
}[] & { get: (ref: Object) => ExecStackByGroup | undefined }
    = Object.create(Array.prototype, {
        "get": {
            value(ref: Object): ExecStackByGroup | undefined {

                let self = this as typeof clusters;

                for (let cluster of self) {
                    if (cluster.ref === ref) {
                        return cluster.execStackByGroup;
                    }
                }

                return undefined;

            }
        }
    });


function getStack(clusterRef: Object, group: string | undefined): ExecStack {

    let execStackByGroup= clusters.get(clusterRef);

    if (!execStackByGroup) {
        execStackByGroup = {};
        clusters.push({ "ref": clusterRef, execStackByGroup });
    }

    if (group === undefined)
        group = "_" + Object.keys(execStackByGroup).join("");

    if (!execStackByGroup[group])
        execStackByGroup[group] = initExecStack();


    return execStackByGroup[group];

}


export function execStack<T extends (...inputs: any[]) => void>(fun: T): T & ExecStack;
export function execStack<T extends (...inputs: any[]) => void>(group: string, fun: T): T & ExecStack;
export function execStack<T extends (...inputs: any[]) => void>(cluster: Object, group: string, fun: T): T & ExecStack;
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

    let stack: ExecStack | undefined = undefined;

    let callee = function (...inputs) {

        if (!stack)
            stack = getStack(cluster || this, group);

        if (stack.isRunning) {
            stack.queuedCalls.push(() => callee.apply(this, inputs));
            return;
        }

        stack.isRunning = true;

        let callback = inputs.pop();
        if (typeof (callback) !== "function") {
            if (callback !== undefined)
                inputs.push(callback);

            callback = undefined;
        }

        let execStackCallback: any= (...inputs) => {

            stack!.isRunning = false;

            if (stack!.queuedCalls.length)
                stack!.queuedCalls.shift() !();

            if (callback)
                callback.apply(this, inputs);

        };

        execStackCallback.hasCallback= callback?true:false;

        fun.apply(this, inputs.concat([execStackCallback]));




    };

    Object.defineProperties(callee, {
        "queuedCalls": {
            get() {
                if (!stack) return [];
                else return stack.queuedCalls;
            }
        },
        "isRunning": {
            get() {
                if (!stack) return false;
                else return stack.isRunning;
            },
            set(isRunning){
                if( !stack ) return;
                stack.isRunning= isRunning;
            }
        },
        "cancelAllQueuedCalls": {
            value() {
                if (!stack) return 0;
                return stack.cancelAllQueuedCalls();
            }
        }
    });

    return callee as T & ExecStack;

}
