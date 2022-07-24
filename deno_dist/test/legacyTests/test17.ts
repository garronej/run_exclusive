//Import ExecStack to be able to export stacked function
import * as runExclusive from "../../lib/runExclusive.ts";
import { Evt } from "https://raw.githubusercontent.com/garronej/ts-evt/v2.2.1/deno_dist/mod.ts";

export class MyClass {

    constructor() { };

    public readonly evtNoCallback = new Evt<string>();

    public myMethod = runExclusive.buildMethodCb(
        (message: string, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {

                if (!(callback as any).hasCallback)
                    this.evtNoCallback.post(message);


                callback!(message)
            }, 1000);

        }
    );


}


let inst = new MyClass();

let success = false

inst.evtNoCallback.attach(message => {

    console.assert(message === "noCallback");

    success = true;

});

inst.myMethod("callback", message => console.assert("callback" === message));
inst.myMethod("noCallback");

setTimeout(() => {

    console.assert(success);

    console.log("DONE");


}, 2500);





