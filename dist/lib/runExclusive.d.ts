export declare class ExecQueue {
    readonly queuedCalls: Function[];
    isRunning: boolean;
    cancelAllQueuedCalls(): number;
}
export declare type ClusterRef = Object | string | number;
export declare function buildMethod<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export declare function buildMethod<T extends (...input: any[]) => Promise<any>>(group: string, fun: T): T;
export declare function build<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export declare function build<T extends (...input: any[]) => Promise<any>>(group: string, fun: T): T;
export declare function getQueuedCallCount(runExclusiveFunction: Function, clusterRef?: ClusterRef): number;
export declare function cancelAllQueuedCalls(runExclusiveFunction: Function, clusterRef?: ClusterRef): number;
export declare function isRunning(runExclusiveFunction: Function, clusterRef?: ClusterRef): boolean;
