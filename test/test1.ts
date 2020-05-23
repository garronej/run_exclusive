import * as runExclusive from "../lib/runExclusive.ts";

class MyClass {

    constructor() { };

    private alphabetStack = "";

    public myMethodStack = runExclusive.buildMethod(
        (char: string): Promise<string> => {

            return new Promise<string>(resolve => {

                setTimeout(() => {
                    this.alphabetStack += char;
                    resolve(this.alphabetStack);
                }, Math.random() * 1000);

            });

        }
    );


}

let inst = new MyClass();

for (let char of ["a", "b", "c", "d", "e", "f"])
    inst.myMethodStack(char).then( alphabet => console.log(`step ${alphabet}`) );


for (let char of ["g", "h", "i"])
    inst.myMethodStack(char);

inst.myMethodStack("j").then( alphabet => {

    console.log(`completed ${alphabet}`);

    //cSpell: disable
    console.assert(alphabet === "abcdefghij");
    //cSpell: enable

    console.log("PASS");

});
