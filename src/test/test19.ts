//Import ExecStack to be able to export stacked function

import { execStack, ExecStack } from "../lib/index";
import { SyncEvent } from "ts-events-extended";


require("colors");

let runCount= 0;

export class MyClass{

    constructor() { };

    public myMethod = execStack(
        (input: string, callback?: (out1: string, out2: number) => void): Promise<[string, number]> => {

            setTimeout(()=> {

                runCount++;

                callback!(input + " 0K", 666)

            }, 1000);

            return null as any;

        }
    );

}

let inst= new MyClass();

(async()=> {

    let [ out1, out2 ]= await inst.myMethod("yo")

    console.assert(out1 === "yo 0K" && out2 === 666 );

    inst.myMethod("ya", (out1, out2)=> console.assert(out1 == "ya 0K" && out2 === 666));

    inst.myMethod("foo");


    setTimeout(()=> {

        console.assert(runCount === 2);

    }, 1100);

    setTimeout(()=> {

        console.assert(runCount === 3);

        console.log("DONE".green);

    }, 3100);


})();










