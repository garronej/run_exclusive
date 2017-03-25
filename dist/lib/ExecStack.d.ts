export declare class ExecStack {
    readonly queuedCalls: Function[];
    isRunning: boolean;
    cancelAllQueuedCalls(): number;
}
export declare function execStack<T extends (...inputs: any[]) => any>(fun: T): T & ExecStack;
export declare function execStack<T extends (...inputs: any[]) => any>(group: string, fun: T): T & ExecStack;
export declare function execStack<T extends (...inputs: any[]) => any>(cluster: Object, group: string, fun: T): T & ExecStack;
