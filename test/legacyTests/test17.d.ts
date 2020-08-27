import { Evt } from "ts-evt";
export declare class MyClass {
    constructor();
    readonly evtNoCallback: Evt<string>;
    myMethod: (message: string, callback?: ((alphabet: string) => void) | undefined) => void;
}
