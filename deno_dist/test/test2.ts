import * as runExclusive from "../lib/runExclusive.ts";

class MyClass{

    constructor(){};

    private readonly groupRefAlphabet= runExclusive.createGroupRef();

    private alphabetStack= "";

    public myMethodUpperCase = runExclusive.buildMethod(this.groupRefAlphabet,
        async (char: string ): Promise<string> => {

            await new Promise<void>(resolve=> setTimeout(()=>resolve(), Math.random()*1000));

            this.alphabetStack += char.toUpperCase();

            return this.alphabetStack;

        }
    );

    public myMethod = runExclusive.buildMethod(this.groupRefAlphabet,
        async (char: string ): Promise<string> => {

            await new Promise<void>(resolve=> setTimeout(()=>resolve(), Math.random()*1000));

            this.alphabetStack += char;

            return this.alphabetStack;

        }
    );


}

let inst = new MyClass();

inst.myMethod("a");

for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethodUpperCase(char).then( alphabet => console.log(`step ${alphabet}`));


for (let char of ["g", "h", "i"])
    inst.myMethod(char).then( alphabet => console.log(`step ${alphabet}`));

inst.myMethod("j").then( alphabet => {

    console.log(`completed ${alphabet}`)

    //cSpell: disable
    console.assert(alphabet === "aBCDEFghij");
    //cSpell: enable

    console.log("PASS");

});