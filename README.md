# ts-exec-stack

Implement a generic stack call to ensure that a particular function
is executed sequential across calls.
(we wait until the function has returned before calling again)


#install

````shell
npm install garronej/ts-exec-stack
````

#usage

````JavaScript
import { execStack } from "ts-exec-stack";

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
````

* Output:
````shell
=========>stackLength:  1000
inside:  okay No callback!
inside:  okay great
outside: okay great

inside:  okay great
outside: okay great

inside:  okay great
outside: okay great

inside:  okay great
outside: okay great

=========>stackLength:  995
inside:  okay great
outside: okay great

inside:  okay great
outside: okay great

Now we flush the stack
inside:  okay great
outside: okay great
````