//Import ExecStack to be able to export stacked function

import { execStack, ExecStack } from "../lib/index";
import { SyncEvent } from "ts-events-extended";


require("colors");

let runCount= 0;

export class MyClass{

    constructor() { };

    public myMethod = execStack(
        (input: number, callback?: (out: string) => void): Promise<string> => {

            setTimeout(()=> {

                runCount++;

                callback!("input: " + input.toString())

            }, 1000);

            return null as any;

        }
    );

}

let inst= new MyClass();

(async()=> {

    let out= await inst.myMethod(111)

    console.log(out);
    console.log( out === "input: 111");

    inst.myMethod(222, out => console.log(out === "input: 222"));

    inst.myMethod(333);


    setTimeout(()=> {

        console.assert(runCount === 2);

    }, 1100);

    setTimeout(()=> {

        console.assert(runCount === 3);

        console.log("DONE".green);

    }, 3100);


})();










