export type Stack = Function [] & {
    flush: ()=> void;
    isReady: boolean;
}

function initStack(): Stack{

    let callStack= [] as Function[];

    return Object.assign(callStack, {
        "flush": ()=> callStack.splice(0, callStack.length),
        "isReady": true
    });

}

interface StackGroupMap{
    [group: string]: Stack;
}

let clusters: [any, StackGroupMap][]= [];

function getStack(cluster: Object, group: string | undefined): Stack{

    let stackGroupMap: StackGroupMap | undefined= undefined;

    for( let elem of clusters )
        if( cluster === elem[0] ){
            stackGroupMap= elem[1];
            break;
        }
    
    if( !stackGroupMap ){
        stackGroupMap= {};
        clusters.push([cluster, stackGroupMap]);
    }

    if( group === undefined )
        group = "_" + Object.keys(stackGroupMap).join("");

    if( !stackGroupMap[group] )
        stackGroupMap[group] = initStack();

    
    return stackGroupMap[group];

}

export interface StackAccess {
    stack: Stack;
}

export function execStack<T extends (...inputs: any[]) => void>(fun: T): T & StackAccess;
export function execStack<T extends (...inputs: any[]) => void>(group: string, fun: T): T & StackAccess;
export function execStack<T extends (...inputs: any[]) => void>(cluster: Object, group: string, fun: T): T & StackAccess;
export function execStack(...inputs: any[]): any{

    switch(inputs.length){
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
): T & StackAccess {

    let stack: Stack | undefined = undefined;

    let callee = function (...inputs) {

        if (!stack)
            stack = getStack(cluster || this, group);

        if (!callee.stack.isReady) {
            callee.stack.push(() => callee.apply(this, inputs));
            return;
        }

        callee.stack.isReady = false;

        let callback = inputs.pop();
        if (typeof (callback) !== "function") {
            if (callback !== undefined)
                inputs.push(callback);

            callback = undefined;
        }

        fun.apply(this, inputs.concat([(...inputs) => {

            if (callback)
                callback.apply(this, inputs);

            callee.stack.isReady = true;

            if (callee.stack.length)
                callee.stack.shift()();

        }]));

    } as any;

    Object.defineProperty(callee, "stack", {
        "enumerable": true,
        "get": (): Stack => {
            if (stack) return stack;

            return initStack();
        }
    });

    return callee;

}