import { execStack } from "../lib/index";

class MyClass{

    private prop= "okay ";

    constructor(){};

    public myMethod= execStack((p: string, callback?: (message: string)=> void): void => {

        //Assume callback always defined

        setTimeout(()=> {
            let message= this.prop + p;
            console.log("inside: ", message);
            callback(message);
        }, 1000);

    });


}

let inst= new MyClass();

inst.myMethod("No callback!");

for( let i=0; i<1000; i++)
    inst.myMethod("great", message => console.log(`outside: ${message}\n`));

console.log("=========>stackLength: ", inst.myMethod.callStack.length);

setTimeout(()=> console.log("=========>stackLength: ", inst.myMethod.callStack.length), 5000);

setTimeout(()=> {
    console.log("Now we flush the stack");
    inst.myMethod.flushStack()
}, 7000);
