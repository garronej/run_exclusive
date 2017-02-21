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


console.assert(inst.myMethod.stack.length=== 0);
console.assert(inst.myMethod.stack.isReady === true);

inst.myMethod("a", ()=>{

    console.assert(inst.myMethod.stack.length === 0);
    console.assert(inst.myMethod.stack.isReady === true);

    console.log("PASS".green);

});



