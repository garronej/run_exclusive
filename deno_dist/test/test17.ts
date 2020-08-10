//Import ExecStack to be able to export stacked function

import * as runExclusive from "../lib/runExclusive.ts";

let runCount = 0;

export class MyClass {

    constructor() { };

    public myMethod = runExclusive.buildMethod(
        async (input: number): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), 1000));

            runCount++;

            return "input: " + input.toString();


        }
    );

}

let inst = new MyClass();

(async () => {

    let out = await inst.myMethod(111);

    console.log(out);
    console.log(out === "input: 111");

    inst.myMethod(222).then(out => console.log(out === "input: 222"));

    inst.myMethod(333);

    setTimeout(() => {

        console.assert(runCount === 2);

    }, 1100);

    setTimeout(() => {

        console.assert(runCount === 3);

        console.log("DONE");

    }, 3100);


})();
