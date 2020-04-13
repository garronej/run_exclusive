import * as runExclusive from "../lib/runExclusive";

class MyClass {

    constructor() { };

    public alphabet = "";

    public static readonly groupRef = runExclusive.createGroupRef();

    public myMethod = runExclusive.buildMethod(MyClass.groupRef,
        async (char: string, wait: number): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), wait));

            this.alphabet += char;

            return this.alphabet;

        }
    );


}


let start = Date.now();

let inst1 = new MyClass();

inst1.myMethod.call(MyClass, "a", 1000).then(alphabet => console.log(alphabet));
inst1.myMethod.call(MyClass, "b", 1000).then(alphabet => console.log(alphabet));

let inst2 = new MyClass();

let rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
let wait = 500;

for (let char of rev)
    inst2.myMethod.call(MyClass, char, wait).then(alphabet => console.log(alphabet));

inst2.myMethod.call(MyClass, "a", wait).then(function () {

    //cSpell: disable
    console.assert(inst2.alphabet === "nmlkjihgfedcba");
    //cSpell: enable

});

inst1.myMethod.call(MyClass, "c", 1000).then(alphabet => console.log(alphabet));
inst1.myMethod.call(MyClass, "d", 1000).then(() => {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(inst1.alphabet === "abcd");
    //cSpell: enable

    let expectedDuration = 1000 * 4 + (rev.length + 1) * wait;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);

    console.log("PASS");

});