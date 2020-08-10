import * as runExclusive from "../../lib/runExclusive";

const groupRefAlphabet = runExclusive.createGroupRef();

class MyClass1 {

    constructor() { };

    public alphabet = "";

    public myMethod = runExclusive.buildCb(groupRefAlphabet,
        (char: string, wait: number, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabet += char.toUpperCase();
                callback!(this.alphabet);
            }, wait);

        });

}



class MyClass2 {

    constructor() { };

    public alphabet = "";

    public myMethod = runExclusive.buildCb(groupRefAlphabet,
        (char: string, wait: number, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabet += char;
                callback!(this.alphabet);
            }, wait);

        }
    );

}




let start = Date.now();

let inst1 = new MyClass1();

inst1.myMethod("a", 1000, alphabet => console.log(alphabet));
inst1.myMethod("b", 1000, alphabet => console.log(alphabet));

let inst2 = new MyClass2();

let rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
let wait = 500;

for (let char of rev){
    inst2.myMethod(char, wait, alphabet => console.log(alphabet));
}

inst2.myMethod("a", wait, function (this: any) {

    //cSpell: disable
    console.assert(this.alphabet === "nmlkjihgfedcba");
    //cSpell: enable

});

inst1.myMethod("c", 1000, alphabet => console.log(alphabet));
inst1.myMethod("d", 1000, () => {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(inst1.alphabet === "ABCD");
    //cSpell: enable

    let expectedDuration = 1000 * 4 + (rev.length + 1) * 500;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);

    console.log("PASS");

});