//Import ExecStack to be able to export stacked function
import { execQueue, ExecQueue } from "../lib/index";
import { SyncEvent } from "ts-events-extended";


require("colors");

export class MyClass{

    constructor(){};

    public readonly evtNoCallback= new SyncEvent<string>();

    public myMethod= execQueue((message: string, callback?: (alphabet: string)=> void): void => {

            if( !(callback as any).hasCallback )
                this.evtNoCallback.post(message);


            callback!(message)

    });


}


let inst = new MyClass();

let success= false

inst.evtNoCallback.attach(message=>{

    console.assert(message === "noCallback");

    success= true;

});

inst.myMethod("noCallback");
inst.myMethod("callback", message => console.assert("callback"===message));


console.assert(success);

console.log("DONE".green);







