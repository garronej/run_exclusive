"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExecStack = (function () {
    function ExecStack() {
        this.queuedCalls = [];
        this.isRunning = false;
    }
    ExecStack.prototype.cancelAllQueuedCalls = function () {
        var n;
        this.queuedCalls.splice(0, n = this.queuedCalls.length);
        return n;
    };
    return ExecStack;
}());
exports.ExecStack = ExecStack;
var clusters = new Map();
function getStack(clusterRef, group) {
    var execStackByGroup = clusters.get(clusterRef);
    if (!execStackByGroup) {
        execStackByGroup = {};
        clusters.set(clusterRef, execStackByGroup);
    }
    if (group === undefined)
        group = "_" + Object.keys(execStackByGroup).join("");
    if (!execStackByGroup[group])
        execStackByGroup[group] = new ExecStack();
    return execStackByGroup[group];
}
function execStack() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1:
            return __execStack__.apply(null, [undefined, undefined].concat(inputs));
        case 2:
            return __execStack__.apply(null, [undefined].concat(inputs));
        case 3:
            return __execStack__.apply(null, inputs);
    }
}
exports.execStack = execStack;
function __execStack__(cluster, group, fun) {
    var execStack = undefined;
    var out = function () {
        var _this = this;
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        if (!execStack)
            execStack = getStack(cluster || this, group);
        var callback = undefined;
        if (inputs.length && typeof inputs[inputs.length - 1] === "function")
            callback = inputs.pop();
        return new Promise(function (resolve) {
            var execStackCallback = function () {
                var inputs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    inputs[_i] = arguments[_i];
                }
                execStack.isRunning = false;
                if (execStack.queuedCalls.length)
                    execStack.queuedCalls.shift()();
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
            execStackCallback.hasCallback = (callback) ? true : false;
            (function callee() {
                var _this = this;
                var inputs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    inputs[_i] = arguments[_i];
                }
                if (execStack.isRunning) {
                    execStack.queuedCalls.push(function () { return callee.apply(_this, inputs); });
                    return;
                }
                execStack.isRunning = true;
                fun.apply(this, inputs.concat([execStackCallback]));
            }).apply(_this, inputs);
        });
    };
    Object.defineProperties(out, {
        "queuedCalls": {
            get: function () {
                if (!execStack)
                    return [];
                else
                    return execStack.queuedCalls;
            }
        },
        "isRunning": {
            get: function () {
                if (!execStack)
                    return false;
                else
                    return execStack.isRunning;
            },
            set: function (isRunning) {
                if (!execStack)
                    return;
                execStack.isRunning = isRunning;
            }
        },
        "cancelAllQueuedCalls": {
            value: function () {
                if (!execStack)
                    return 0;
                return execStack.cancelAllQueuedCalls();
            }
        }
    });
    return out;
}
//# sourceMappingURL=ExecStack.js.map