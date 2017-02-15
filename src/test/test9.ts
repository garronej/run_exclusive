import { execStack } from "../lib/index";

require("colors");

class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod= execStack((char: string, callback?: (alphabet: string)=> void): void => {

        //Assume callback always defined

        setTimeout(()=> {
            this.alphabet+= char;
            callback(this.alphabet);
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

for( let char of [ "a", "b", "c", "d", "e", "f" ])
    inst.myMethod(char, alphabet=>console.log(`step ${alphabet}`));




