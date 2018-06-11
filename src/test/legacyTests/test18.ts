import * as runExclusive from "../../lib/runExclusive";
import { SyncEvent } from "ts-events-extended";

export class MyClass {

    constructor() { };

    public readonly evtNoCallback = new SyncEvent<string>();

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

console.log("DONE".green);