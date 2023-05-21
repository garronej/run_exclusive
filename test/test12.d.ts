export declare class MyClass {
    constructor();
    alphabet: string;
    myMethod: (char: string) => Promise<string>;
}
export declare class MyClassProxy {
    private myClassInst;
    readonly evtCreate: import("evt/lib/types").Evt<void>;
    getAlphabet(): typeof MyClass.prototype.alphabet;
    constructor();
    myMethod: typeof MyClass.prototype.myMethod;
}
