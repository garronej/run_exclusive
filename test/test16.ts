import * as runExclusive from "../lib/runExclusive";

let runCount= 0;

export class MyClass{

    constructor() { };

    public myMethod = runExclusive.buildMethod(
        async (input: string): Promise<[string, number]> => {

            await new Promise<void>(resolve=> setTimeout(()=>resolve(), 1000));

            runCount++;

            return [input + " 0K", 666];

        }
    );

}

let inst= new MyClass();

(async()=> {

    let [ out1, out2 ]= await inst.myMethod("yo")

    console.assert(out1 === "yo 0K" && out2 === 666 );

    inst.myMethod("ya").then(([out1, out2])=> console.assert(out1 == "ya 0K" && out2 === 666));

    inst.myMethod("foo");

    setTimeout(()=> {

        console.assert(runCount === 2);

    }, 1100);

    setTimeout(()=> {

        console.assert(runCount === 3);

        console.log("DONE");

    }, 3100);


})();










