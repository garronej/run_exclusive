import { execStack } from "../lib/index";

require("colors");


class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod= execStack((char: string, callback?: (alphabet: string)=> void): void => {

        setTimeout(()=> {
            this.alphabet+= char;
            callback!(this.alphabet);
        }, 1000);

    });


}

class MyClassProxy{

    constructor(){};

    private myClassInst = new MyClass();

    public callCount = 0;

    public get alphabet(): typeof MyClass.prototype.alphabet {
        return this.myClassInst.alphabet;
    }


    public myMethod: typeof MyClass.prototype.myMethod =
    (()=>{

        let out= (...inputs)=>{

                this.callCount++;
        
                this.myClassInst.myMethod.apply(this.myClassInst, inputs);

        };


        Object.defineProperties( out, {
            "queuedCalls": Object.getOwnPropertyDescriptor(this.myClassInst.myMethod, "queuedCalls"),
            "isRunning": Object.getOwnPropertyDescriptor(this.myClassInst.myMethod, "isRunning"),
            "cancelAllQueuedCalls": Object.getOwnPropertyDescriptor(this.myClassInst.myMethod, "cancelAllQueuedCalls")
        });

        return out as any;

    })();



}

let inst = new MyClassProxy();


setTimeout(() => {

    console.assert(inst.myMethod.queuedCalls.length === 3);

    console.assert(inst.alphabet === "ab");

    inst.myMethod.cancelAllQueuedCalls();

    setTimeout(() => {

        console.assert(inst.alphabet === "abc");

        console.log("PASS".green);

    }, 2000);

}, 2900);

console.assert(inst.myMethod.queuedCalls.length === 0);
console.assert(inst.myMethod.isRunning === false);
inst.myMethod("a");
console.assert(inst.myMethod.queuedCalls.length === 0);
console.assert(inst.myMethod.isRunning === true);

for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));

console.assert(inst.myMethod.queuedCalls.length === 5);
console.assert(inst.myMethod.isRunning === true);


console.assert(inst.callCount === 6);

