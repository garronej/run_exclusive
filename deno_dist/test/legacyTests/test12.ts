//Import ExecStack to be able to export stacked function
import * as runExclusive from "../../lib/runExclusive.ts";
import { VoidEvt } from "ts-evt DENOIFY: DEPENDENCY UNMET (DEV DEPENDENCY)";

export class MyClass {

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

export class MyClassProxy {


    private myClassInst: MyClass | undefined = undefined;

    public readonly evtCreate = new VoidEvt();

    public getAlphabet(): typeof MyClass.prototype.alphabet {
        if (!this.myClassInst) return "";
        else return this.myClassInst.alphabet;
    }

    constructor() {

        setTimeout(() => {
            this.myClassInst = new MyClass();
            this.evtCreate.post();
        }, 1000);

    }

    public myMethod = runExclusive.buildMethodCb(
        function callee(this: any, ...inputs) {

            let self = this as MyClassProxy;

            if (!self.myClassInst) {

                self.evtCreate.attachOnce(() => callee.apply(this, inputs));
                return;

            }

            self.myClassInst.myMethod.apply(self.myClassInst, inputs);


        } as typeof MyClass.prototype.myMethod);

}

let inst = new MyClassProxy();


setTimeout(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 3);

    console.assert(inst.getAlphabet() === "ab");

    runExclusive.cancelAllQueuedCalls(inst.myMethod, inst);

    setTimeout(() => {

        console.assert(inst.getAlphabet() === "abc");

        console.log("PASS");

    }, 2000);

}, 2900 + 1000);


console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);
inst.myMethod("a");
console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);


for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));

console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 5);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);



