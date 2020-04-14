import * as runExclusive from "../lib/runExclusive";

class MyClass{

    constructor(){};

    public alphabet= "";

    public myMethod1= runExclusive.buildMethod(runExclusive.createGroupRef(), 
        async (char: string, wait: number): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), wait));

            this.alphabet += char;

            return this.alphabet;

        }
    );

    public alphabet2 = "";

    public myMethod2 = runExclusive.buildMethod(
        async (char: string, wait: number): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), wait));

            this.alphabet2 += char;

            return this.alphabet2;

        }
    );




}


let start = Date.now();

let inst = new MyClass();

inst.myMethod1("a", 1000).then( alphabet => console.log(alphabet) );
inst.myMethod1("b", 1000).then( alphabet => console.log(alphabet) );


let rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
let wait = 500;

for (let char of rev)
    inst.myMethod2(char, wait).then( alphabet => console.log(alphabet));

inst.myMethod2("a", wait ).then( function () {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(inst.alphabet2 === "nmlkjihgfedcba");
    //cSpell: enable

    let expectedDuration = (rev.length + 1) * wait;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);

    console.log("PASS");


});

inst.myMethod1("c", 1000).then( alphabet => console.log(alphabet));
inst.myMethod1("d", 1000).then( () => {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(inst.alphabet === "abcd");
    //cSpell: enable

    let expectedDuration = 1000 * 4;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);


});