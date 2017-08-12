"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
var clusterRefGlobal = ["GLOBAL_CLUSTER_REF"];
function buildMethod() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnPromise(undefined, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(undefined, inputs[0], inputs[1]);
    }
}
exports.buildMethod = buildMethod;
function build() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnPromise(clusterRefGlobal, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(clusterRefGlobal, inputs[0], inputs[1]);
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
function buildFnPromise(clusterRef, groupRef, fun) {
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
function buildMethodCb() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnCallback(undefined, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(undefined, inputs[0], inputs[1]);
    }
}
exports.buildMethodCb = buildMethodCb;
function buildCb() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnCallback(clusterRefGlobal, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(clusterRefGlobal, inputs[0], inputs[1]);
    }
}
exports.buildCb = buildCb;
function buildFnCallback(clusterRef, groupRef, fun) {
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
        var callback = undefined;
        if (inputs.length && typeof inputs[inputs.length - 1] === "function")
            callback = inputs.pop();
        return new Promise(function (resolve, reject) {
            var onComplete = function () {
                var inputs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    inputs[_i] = arguments[_i];
                }
                execQueue.isRunning = false;
                if (execQueue.queuedCalls.length)
                    execQueue.queuedCalls.shift()();
                if (callback)
                    callback.apply(_this, inputs);
                switch (inputs.length) {
                    case 0:
                        resolve();
                        break;
                    case 1:
                        resolve(inputs[0]);
                        break;
                    default: resolve(inputs);
                }
            };
            onComplete.hasCallback = (callback) ? true : false;
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
                    fun.apply(this, __spread(inputs, [onComplete]));
                }
                catch (error) {
                    reject(error);
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
