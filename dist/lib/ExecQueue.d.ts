export declare class ExecQueue {
    readonly queuedCalls: Function[];
    isRunning: boolean;
    cancelAllQueuedCalls(): number;
}
export declare function execQueue<T extends (...inputs: any[]) => any>(fun: T): T & ExecQueue;
export declare function execQueue<T extends (...inputs: any[]) => any>(group: string, fun: T): T & ExecQueue;
export declare function execQueue<T extends (...inputs: any[]) => any>(cluster: Object, group: string, fun: T): T & ExecQueue;
