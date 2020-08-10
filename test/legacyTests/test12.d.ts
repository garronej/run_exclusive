import { VoidEvt } from "ts-evt";
export declare class MyClass {
    constructor();
    alphabet: string;
    myMethod: (char: string, callback?: ((alphabet: string) => void) | undefined) => void;
}
export declare class MyClassProxy {
    private myClassInst;
    readonly evtCreate: VoidEvt;
    getAlphabet(): typeof MyClass.prototype.alphabet;
    constructor();
    myMethod: (char: string, callback?: ((alphabet: string) => void) | undefined) => void;
}
