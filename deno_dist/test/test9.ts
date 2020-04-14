import * as runExclusive from "../lib/runExclusive.ts";

class MyClass {

    constructor() { };

    public alphabet = "";

    public myMethod = runExclusive.buildMethod(
        async (char: string): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), 1000));

            this.alphabet += char;

            return this.alphabet;

        }
    );


}

let inst = new MyClass();

setTimeout(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 3)

    console.assert(inst.alphabet === "ab");

    runExclusive.cancelAllQueuedCalls(inst.myMethod, inst);

    setTimeout(() => {

        console.assert(inst.alphabet === "abc");

        console.log("PASS");

    }, 2000);

}, 2900);

for (let char of ["a", "b", "c", "d", "e", "f"]){
    inst.myMethod(char).then(alphabet => console.log(`step ${alphabet}`));
}

