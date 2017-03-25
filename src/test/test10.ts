import { execQueue } from "../lib/index";


require("colors");

class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod= execQueue((char: string, callback?: (alphabet: string)=> void): void => {

        setTimeout(()=> {
            this.alphabet+= char;
            callback!(this.alphabet);
        }, 1000);

    });


}

let inst= new MyClass();


setTimeout(()=>{

    console.assert(inst.myMethod.queuedCalls.length === 3);

    console.assert(inst.alphabet === "ab");

    inst.myMethod.cancelAllQueuedCalls();

    setTimeout(()=>{

        console.assert(inst.alphabet === "abc");

        console.log("PASS".green);

    }, 2000);

}, 2900);

console.assert(inst.myMethod.queuedCalls.length=== 0);
console.assert(inst.myMethod.isRunning === false);
inst.myMethod("a");
console.assert(inst.myMethod.queuedCalls.length=== 0);
console.assert(inst.myMethod.isRunning === true);

for( let char of [ "b", "c", "d", "e", "f" ])
    inst.myMethod(char, alphabet=>console.log(`step ${alphabet}`));

console.assert(inst.myMethod.queuedCalls.length=== 5);
console.assert(inst.myMethod.isRunning === true);


