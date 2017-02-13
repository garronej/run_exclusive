import { execStack } from "../lib/index";

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
