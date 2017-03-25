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


console.assert(inst.myMethod.queuedCalls.length=== 0);
console.assert(inst.myMethod.isRunning === false);

inst.myMethod("a", ()=>{

    console.assert(inst.myMethod.queuedCalls.length === 0);
    console.assert(inst.myMethod.isRunning === false);

    console.log("PASS".green);

});



