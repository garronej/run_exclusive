import * as runExclusive from "../../lib/runExclusive.ts";
import {  Evt } from "ts-evt DENOIFY: DEPENDENCY UNMET (DEV DEPENDENCY)";

export class MyClass {

    constructor() { };

    public readonly evtNoCallback = new Evt<string>();

    public myMethod = runExclusive.buildMethodCb(
        (message: string, callback?: (alphabet: string) => void): void => {

            if (!(callback as any).hasCallback)
                this.evtNoCallback.post(message);

            callback!(message)

        }
    );


}


let inst = new MyClass();

let success = false

inst.evtNoCallback.attach(message => {

    console.assert(message === "noCallback");

    success = true;

});

inst.myMethod("noCallback");
inst.myMethod("callback", message => console.assert("callback" === message));


console.assert(success);

console.log("DONE");