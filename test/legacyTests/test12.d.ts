export declare class MyClass {
    constructor();
    alphabet: string;
    myMethod: (char: string, callback?: ((alphabet: string) => void) | undefined) => void;
}
export declare class MyClassProxy {
    private myClassInst;
    readonly evtCreate: import("evt/lib/types").Evt<void>;
    getAlphabet(): typeof MyClass.prototype.alphabet;
    constructor();
    myMethod: (char: string, callback?: ((alphabet: string) => void) | undefined) => void;
}
