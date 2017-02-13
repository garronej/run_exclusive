
export function execStack<T extends (...inputs: any[]) => void>(fun: T): T & {
    "callStack": Function[],
    "flushStack": () => void
} {

    let callStack: Function[] = [];
    let isReady = true;

    let callee = function (...inputs) {

        if (!isReady) {
            callStack.push(callee.bind.apply(callee, [this].concat(inputs)));
            return;
        }

        isReady = false;

        let callback = inputs.pop();
        if (typeof (callback) !== "function") {
            if (callback !== undefined)
                inputs.push(callback);

            callback = undefined;
        }

        fun.apply(this, inputs.concat([(...inputs) => {

            if (callback)
                callback.apply(this, inputs);

            isReady = true;

            if (callStack.length)
                callStack.shift()();

        }]));

    } as any;

    callee.callStack = callStack;

    callee.flushStack= ()=>{ callStack= []; };

    return callee;

}