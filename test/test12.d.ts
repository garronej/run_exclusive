import { VoidEvt } from "ts-evt";
export declare class MyClass {
    constructor();
    alphabet: string;
    myMethod: (char: string) => Promise<string>;
}
export declare class MyClassProxy {
    private myClassInst;
    readonly evtCreate: VoidEvt;
    getAlphabet(): typeof MyClass.prototype.alphabet;
    constructor();
    myMethod: typeof MyClass.prototype.myMethod;
}
