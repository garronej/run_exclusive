import * as runExclusive from "../../lib/runExclusive";

class MyClass {

    constructor() { };

    private alphabetStack = "";

    private groupRef = runExclusive.createGroupRef();

    public myMethodUpperCase = runExclusive.buildMethodCb(
        this.groupRef,
        (char: string, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabetStack += char.toUpperCase();
                callback!(this.alphabetStack);
            }, Math.random() * 1000);

        }
    );


    public myMethod = runExclusive.buildMethodCb(
        this.groupRef,
        (char: string, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabetStack += char;
                callback!(this.alphabetStack);
            }, Math.random() * 1000);

        }
    );


}

let inst = new MyClass();


inst.myMethod("a");

for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethodUpperCase(char, alphabet => console.log(`step ${alphabet}`));


for (let char of ["g", "h", "i"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));

inst.myMethod("j", alphabet => {

    console.log(`completed ${alphabet}`)

    //cSpell: disable
    console.assert(alphabet === "aBCDEFghij");
    //cSpell: enable

    console.log("PASS");

});