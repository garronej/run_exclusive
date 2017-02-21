//Import StackAccess and Stack to be able to export stacked function
import { execStack, StackAccess, Stack } from "../lib/index";
import { VoidSyncEvent } from "ts-events-extended";

require("colors");

export class MyClass{

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

    console.assert(inst.myMethod.stack.length === 3);

    console.assert(inst.alphabet === "ab");

    inst.myMethod.stack.flush();

    setTimeout(() => {

        console.assert(inst.alphabet === "abc");

        console.log("PASS".green);

    }, 2000);

}, 2900 + 1000);


console.assert(inst.myMethod.stack.length === 0);
console.assert(inst.myMethod.stack.isReady === true);
inst.myMethod("a");
console.assert(inst.myMethod.stack.length === 0);
console.assert(inst.myMethod.stack.isReady === false);


for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));

console.assert(inst.myMethod.stack.length === 5);
console.assert(inst.myMethod.stack.isReady === false);



