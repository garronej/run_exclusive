import * as runExclusive from "../lib/runExclusive";

class MyClass {

    constructor() { };

    public alphabet = "";


    public myMethod = runExclusive.buildMethod(
        async (char: string): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), 1000));

            this.alphabet += char;

            return this.alphabet;

        });


}

let inst = new MyClass();

console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);

inst.myMethod("a").then(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 1);
    console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);

});
inst.myMethod("b").then(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
    console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);


});
inst.myMethod("c").then(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
    console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);

    console.log("PASS");

});
