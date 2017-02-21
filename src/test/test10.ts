import { execStack } from "../lib/index";

require("colors");

class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod= execStack((char: string, callback?: (alphabet: string)=> void): void => {

        let safeCallback= callback || function(){};

        setTimeout(()=> {
            this.alphabet+= char;
            safeCallback(this.alphabet);
        }, 1000);

    });


}

let inst= new MyClass();


setTimeout(()=>{

    console.assert(inst.myMethod.stack.length === 3);

    console.assert(inst.alphabet === "ab");

    inst.myMethod.stack.flush();

    setTimeout(()=>{

        console.assert(inst.alphabet === "abc");

        console.log("PASS".green);

    }, 2000);

}, 2900);

console.assert(inst.myMethod.stack.length=== 0);
console.assert(inst.myMethod.stack.isReady === true);
inst.myMethod("a");
console.assert(inst.myMethod.stack.length=== 0);
console.assert(inst.myMethod.stack.isReady === false);

for( let char of [ "b", "c", "d", "e", "f" ])
    inst.myMethod(char, alphabet=>console.log(`step ${alphabet}`));

console.assert(inst.myMethod.stack.length=== 5);
console.assert(inst.myMethod.stack.isReady === false);


