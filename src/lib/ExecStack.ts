export function execStack<T extends (...inputs: any[]) => void>(fun: T): T {

    let callStack: Function[] = [];
    let isReady = true;

    return function callee(...inputs) {

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

}