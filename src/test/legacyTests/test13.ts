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

let inst = new MyClass();


console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 0);
console.assert(runExclusive.isRunning(inst.myMethod) === false);

inst.myMethod("a", () => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 0);
    console.assert(runExclusive.isRunning(inst.myMethod) === false);

    console.log("PASS".green);

});



