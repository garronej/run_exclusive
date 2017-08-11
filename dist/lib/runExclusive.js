"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExecQueue = (function () {
    function ExecQueue() {
        this.queuedCalls = [];
        this.isRunning = false;
    }
    ExecQueue.prototype.cancelAllQueuedCalls = function () {
        var n;
        this.queuedCalls.splice(0, n = this.queuedCalls.length);
        return n;
    };
    return ExecQueue;
}());
exports.ExecQueue = ExecQueue;
var clusters = new Map();
function getOrCreateExecQueue(clusterRef, groupRef) {
    var execQueueByGroup = clusters.get(clusterRef);
    if (!execQueueByGroup) {
        execQueueByGroup = new Map();
        clusters.set(clusterRef, execQueueByGroup);
    }
    var execQueue = execQueueByGroup.get(groupRef);
    if (!execQueue) {
        execQueue = new ExecQueue();
        execQueueByGroup.set(groupRef, execQueue);
    }
    return execQueue;
}
function createGroupRef() {
    return [];
}
exports.createGroupRef = createGroupRef;
function buildMethod() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return _build_(undefined, createGroupRef(), inputs[0]);
        case 2: return _build_(undefined, inputs[0], inputs[1]);
    }
}
exports.buildMethod = buildMethod;
var clusterRefGlobal = ["GLOBAL_CLUSTER_REF"];
function build() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return _build_(clusterRefGlobal, createGroupRef(), inputs[0]);
        case 2: return _build_(clusterRefGlobal, inputs[0], inputs[1]);
    }
}
exports.build = build;
function getQueuedCallCount(runExclusiveFunction, clusterRef) {
    var execQueue = getExecQueueFromFunction(runExclusiveFunction, clusterRef);
    return execQueue ? execQueue.queuedCalls.length : 0;
}
exports.getQueuedCallCount = getQueuedCallCount;
function cancelAllQueuedCalls(runExclusiveFunction, clusterRef) {
    var execQueue = getExecQueueFromFunction(runExclusiveFunction, clusterRef);
    return execQueue ? execQueue.cancelAllQueuedCalls() : 0;
}
exports.cancelAllQueuedCalls = cancelAllQueuedCalls;
function isRunning(runExclusiveFunction, clusterRef) {
    var execQueue = getExecQueueFromFunction(runExclusiveFunction, clusterRef);
    return execQueue ? execQueue.isRunning : false;
}
exports.isRunning = isRunning;
var execQueueRefByFunction = new Map();
function getExecQueueFromFunction(runExclusiveFunction, clusterRef) {
    if (!execQueueRefByFunction.has(runExclusiveFunction))
        throw new Error("This is not a run exclusive function");
    var _a = execQueueRefByFunction.get(runExclusiveFunction), clusterRefLastCall = _a.clusterRefLastCall, groupRef = _a.groupRef;
    if (clusterRef === undefined) {
        if (clusterRefLastCall === undefined)
            return undefined;
        clusterRef = clusterRefLastCall;
    }
    var execQueueByGroup = clusters.get(clusterRef);
    if (!execQueueByGroup)
        return undefined;
    var execQueue = execQueueByGroup.get(groupRef);
    if (!execQueue)
        return undefined;
    return execQueue;
}
function _build_(clusterRef, groupRef, fun) {
    var out = (function () {
        var _this = this;
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        var execQueue;
        if (clusterRef === undefined) {
            execQueue = getOrCreateExecQueue(this, groupRef);
            execQueueRefByFunction.get(out).clusterRefLastCall = this;
        }
        else {
            execQueue = getOrCreateExecQueue(clusterRef, groupRef);
        }
        return new Promise(function (resolve, reject) {
            var onComplete = function (result) {
                execQueue.isRunning = false;
                if (execQueue.queuedCalls.length)
                    execQueue.queuedCalls.shift()();
                if ("data" in result)
                    resolve(result["data"]);
                else
                    reject(result["reason"]);
            };
            (function callee() {
                var _this = this;
                var inputs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    inputs[_i] = arguments[_i];
                }
                if (execQueue.isRunning) {
                    execQueue.queuedCalls.push(function () { return callee.apply(_this, inputs); });
                    return;
                }
                execQueue.isRunning = true;
                try {
                    fun.apply(this, inputs)
                        .then(function (data) { return onComplete({ data: data }); })
                        .catch(function (reason) { return onComplete({ reason: reason }); });
                }
                catch (error) {
                    onComplete({ "reason": error });
                }
            }).apply(_this, inputs);
        });
    });
    execQueueRefByFunction.set(out, {
        "clusterRefLastCall": (clusterRef === undefined) ? undefined : clusterRef,
        groupRef: groupRef
    });
    return out;
}
