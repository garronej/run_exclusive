export declare class MyClass {
    constructor();
    readonly evtNoCallback: import("evt/lib/types").Evt<string>;
    myMethod: (message: string, callback?: ((alphabet: string) => void) | undefined) => void;
}
