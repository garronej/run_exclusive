import * as runExclusive from "../../lib/runExclusive.ts";

class MyClass {

    constructor() { };

    public alphabet = "";


    public myMethod = runExclusive.buildMethodCb(
        runExclusive.createGroupRef(),
        (char: string, wait: number, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabet += char;
                callback!(this.alphabet);
            }, wait);

        }
    );


}


let start = Date.now();

let inst1 = new MyClass();

inst1.myMethod("a", 1000, alphabet => console.log(alphabet));
inst1.myMethod("b", 1000, alphabet => console.log(alphabet));

let inst2 = new MyClass();

let rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
let wait = 500;

for (let char of rev)
    inst2.myMethod(char, wait, alphabet => console.log(alphabet));
inst2.myMethod("a", wait, function (this: any) {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(this.alphabet === "nmlkjihgfedcba");
    //cSpell: enable

    let expectedDuration = (rev.length + 1) * 500;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);

    console.log("PASS");


});

inst1.myMethod("c", 1000, alphabet => console.log(alphabet));
inst1.myMethod("d", 1000, () => {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(inst1.alphabet === "abcd");
    //cSpell: enable

    let expectedDuration = 1000 * 4;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);

});