import * as runExclusive from "../../lib/runExclusive";

require("colors");


class MyClass {

    constructor() { };

    public alphabet = "";


    public myMethod = runExclusive.buildMethodCb(
        (char: string, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabet += char;
                callback!(this.alphabet);
            }, 1000);

        }
    );


}

class MyClassProxy {

    constructor() { };

    private myClassInst = new MyClass();

    public callCount = 0;

    public getAlphabet(): typeof MyClass.prototype.alphabet {
        return this.myClassInst.alphabet;
    }


    public myMethod: typeof MyClass.prototype.myMethod =
    runExclusive.buildMethodCb(
        (...inputs) => {

            this.callCount++;

            return this.myClassInst.myMethod.apply(this.myClassInst, inputs);

        }
    );

}

let inst = new MyClassProxy();


setTimeout(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 3);

    console.assert(inst.getAlphabet() === "ab");

    runExclusive.cancelAllQueuedCalls(inst.myMethod);

    setTimeout(() => {

        console.assert(inst.getAlphabet() === "abc");

        console.log("PASS".green);

    }, 2000);

}, 2900);

console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 0);
console.assert(runExclusive.isRunning(inst.myMethod) === false );
inst.myMethod("a");
console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 0);
console.assert(runExclusive.isRunning(inst.myMethod) === true );

for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));

console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 5);
console.assert(runExclusive.isRunning(inst.myMethod) === true );


console.assert(inst.callCount === 1);

