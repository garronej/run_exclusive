//Import ExecStack to be able to export stacked function
import { execStack, ExecStack } from "../lib/index";
import { VoidSyncEvent } from "ts-events-extended";

require("colors");

export class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod= execStack((char: string, callback?: (alphabet: string)=> void): void => {

        setTimeout(()=> {
            this.alphabet+= char;
            callback!(this.alphabet);
        }, 1000);

    });


}

export class MyClassProxy{


    private myClassInst: MyClass | undefined= undefined;

    public readonly evtCreate= new VoidSyncEvent();

    public get alphabet(): typeof MyClass.prototype.alphabet {
        if( !this.myClassInst ) return "";
        else return this.myClassInst.alphabet;
    }

    constructor(){

        setTimeout(()=> { 
            this.myClassInst= new MyClass(); 
            this.evtCreate.post();
        }, 1000);

    }

    public myMethod= execStack(function callee(...inputs){

            let self= this as MyClassProxy;

            if (!self.myClassInst) {

                self.evtCreate.attachOnce(() => callee.apply(this, inputs));
                return;

            }

            self.myClassInst.myMethod.apply(self.myClassInst, inputs);


    } as typeof MyClass.prototype.myMethod);



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

}, 2900 + 1000);


console.assert(inst.myMethod.queuedCalls.length === 0);
console.assert(inst.myMethod.isRunning === false);
inst.myMethod("a");
console.assert(inst.myMethod.queuedCalls.length === 0);
console.assert(inst.myMethod.isRunning === true);


for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));

console.assert(inst.myMethod.queuedCalls.length === 5);
console.assert(inst.myMethod.isRunning === true);



