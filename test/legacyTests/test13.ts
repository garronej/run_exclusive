import * as runExclusive from "../../lib/runExclusive";

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

let inst = new MyClass();


console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);

inst.myMethod("a", () => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
    console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);

    console.log("PASS");

});



