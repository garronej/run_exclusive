export declare class ExecQueue {
    readonly queuedCalls: Function[];
    isRunning: boolean;
    cancelAllQueuedCalls(): number;
}
export declare type GroupRef = never[];
export declare type ClusterRef = Object | string;
export declare function createGroupRef(): GroupRef;
export declare function buildMethod<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export declare function buildMethod<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
export declare function build<T extends (...input: any[]) => Promise<any>>(fun: T): T;
export declare function build<T extends (...input: any[]) => Promise<any>>(groupRef: GroupRef, fun: T): T;
export declare function getQueuedCallCount(runExclusiveFunction: Function, clusterRef?: ClusterRef): number;
export declare function cancelAllQueuedCalls(runExclusiveFunction: Function, clusterRef?: ClusterRef): number;
export declare function isRunning(runExclusiveFunction: Function, clusterRef?: ClusterRef): boolean;
export declare function buildMethodCb<T extends (...input: any[]) => any>(fun: T): T;
export declare function buildMethodCb<T extends (...input: any[]) => any>(groupRef: GroupRef, fun: T): T;
export declare function buildCb<T extends (...input: any[]) => any>(fun: T): T;
export declare function buildCb<T extends (...input: any[]) => any>(groupRef: GroupRef, fun: T): T;
