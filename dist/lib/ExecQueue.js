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
function getQueue(clusterRef, group) {
    var execQueueByGroup = clusters.get(clusterRef);
    if (!execQueueByGroup) {
        execQueueByGroup = {};
        clusters.set(clusterRef, execQueueByGroup);
    }
    if (group === undefined)
        group = "_" + Object.keys(execQueueByGroup).join("");
    if (!execQueueByGroup[group])
        execQueueByGroup[group] = new ExecQueue();
    return execQueueByGroup[group];
}
function execQueue() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1:
            return __execQueue__.apply(null, [undefined, undefined].concat(inputs));
        case 2:
            return __execQueue__.apply(null, [undefined].concat(inputs));
        case 3:
            return __execQueue__.apply(null, inputs);
    }
}
exports.execQueue = execQueue;
function __execQueue__(cluster, group, fun) {
    var execQueue = undefined;
    var out = function () {
        var _this = this;
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        if (!execQueue)
            execQueue = getQueue(cluster || this, group);
        var callback = undefined;
        if (inputs.length && typeof inputs[inputs.length - 1] === "function")
            callback = inputs.pop();
        return new Promise(function (resolve) {
            var execQueueCallback = function () {
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
            execQueueCallback.hasCallback = (callback) ? true : false;
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
                fun.apply(this, inputs.concat([execQueueCallback]));
            }).apply(_this, inputs);
        });
    };
    Object.defineProperties(out, {
        "queuedCalls": {
            get: function () {
                if (!execQueue)
                    return [];
                else
                    return execQueue.queuedCalls;
            }
        },
        "isRunning": {
            get: function () {
                if (!execQueue)
                    return false;
                else
                    return execQueue.isRunning;
            },
            set: function (isRunning) {
                if (!execQueue)
                    return;
                execQueue.isRunning = isRunning;
            }
        },
        "cancelAllQueuedCalls": {
            value: function () {
                if (!execQueue)
                    return 0;
                return execQueue.cancelAllQueuedCalls();
            }
        }
    });
    return out;
}
//# sourceMappingURL=ExecQueue.js.map