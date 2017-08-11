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
var generateUniqGroup = (function () {
    var counter = 0;
    return function () { return "zFw3#Te0x-@sR=xElM%dEfKln===" + counter++; };
})();
function getOrCreateExecQueue(clusterRef, group) {
    var execQueueByGroup = clusters.get(clusterRef);
    if (!execQueueByGroup) {
        execQueueByGroup = {};
        clusters.set(clusterRef, execQueueByGroup);
    }
    if (!execQueueByGroup[group])
        execQueueByGroup[group] = new ExecQueue();
    return execQueueByGroup[group];
}
var clusterRefGlobal = ["GLOBAL CLUSTER REF"];
function buildMethod() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return _build_(undefined, undefined, inputs[0]);
        case 2: return _build_(undefined, inputs[0], inputs[1]);
    }
}
exports.buildMethod = buildMethod;
function build() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return _build_(clusterRefGlobal, undefined, inputs[0]);
        case 2: return _build_(clusterRefGlobal, inputs[0], inputs[1]);
    }
}
exports.build = build;
var execQueueRefByFunction = new Map();
function getQueuedCallCount(runExclusiveFunction, clusterRef) {
    return getExecQueue(runExclusiveFunction, clusterRef).queuedCalls.length;
}
exports.getQueuedCallCount = getQueuedCallCount;
function cancelAllQueuedCalls(runExclusiveFunction, clusterRef) {
    return getExecQueue(runExclusiveFunction, clusterRef).cancelAllQueuedCalls();
}
exports.cancelAllQueuedCalls = cancelAllQueuedCalls;
function isRunning(runExclusiveFunction, clusterRef) {
    return getExecQueue(runExclusiveFunction, clusterRef).isRunning;
}
exports.isRunning = isRunning;
function getExecQueue(runExclusiveFunction, clusterRef) {
    if (!execQueueRefByFunction.has(runExclusiveFunction))
        throw new Error("This is not a run exclusive function");
    var _a = execQueueRefByFunction.get(runExclusiveFunction), clusterRefLastCall = _a.clusterRefLastCall, group = _a.group;
    if (clusterRef === undefined)
        clusterRef = clusterRefLastCall;
    var execQueueByGroup = clusters.get(clusterRef);
    if (!execQueueByGroup)
        return new ExecQueue();
    var execQueue = execQueueByGroup[group];
    if (!execQueue)
        return new ExecQueue();
    return execQueue;
}
function _build_(clusterRef, group, fun) {
    if (group === undefined)
        group = generateUniqGroup();
    var out = (function () {
        var _this = this;
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        var execQueue;
        if (clusterRef === undefined) {
            execQueue = getOrCreateExecQueue(this, group);
            execQueueRefByFunction.get(out).clusterRefLastCall = this;
        }
        else {
            execQueue = getOrCreateExecQueue(clusterRef, group);
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
    if (clusterRef === undefined) {
        var tmpClusterRef = ["TMP BEFORE FIRST CALL"];
        execQueueRefByFunction.set(out, {
            "clusterRefLastCall": tmpClusterRef,
            group: group
        });
        getOrCreateExecQueue(tmpClusterRef, group);
    }
    else {
        execQueueRefByFunction.set(out, {
            "clusterRefLastCall": clusterRef,
            group: group
        });
        getOrCreateExecQueue(clusterRef, group);
    }
    return out;
}
