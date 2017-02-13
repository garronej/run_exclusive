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

        setTimeout(()=> {
            let message= this.prop + p;
            console.log("inside: ", message);
            if( callback )
                callback(message);
        }, 1000);

    });

}

let i= new MyClass();

i.myMethod("great", message => console.log("outside: ",message));
i.myMethod("great");
i.myMethod("great", message => console.log("outside: ",message));
````

* Output:
````shell
(After one sec)
inside:  okay great
outside:  okay great
(After one sec)
inside:  okay great
(After one sec)
inside:  okay great
outside:  okay great
````