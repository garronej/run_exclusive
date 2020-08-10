"use strict";
exports.__esModule = true;
exports.MyClassProxy = exports.MyClass = void 0;
//Import ExecStack to be able to export stacked function
var runExclusive = require("../../lib/runExclusive");
var ts_evt_1 = require("ts-evt");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabet = "";
        this.myMethod = runExclusive.buildMethodCb(function (char, callback) {
            setTimeout(function () {
                _this.alphabet += char;
                callback(_this.alphabet);
            }, 1000);
        });
    }
    ;
    return MyClass;
}());
exports.MyClass = MyClass;
var MyClassProxy = /** @class */ (function () {
    function MyClassProxy() {
        var _this = this;
        this.myClassInst = undefined;
        this.evtCreate = new ts_evt_1.VoidEvt();
        this.myMethod = runExclusive.buildMethodCb(function callee() {
            var _this = this;
            var inputs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                inputs[_i] = arguments[_i];
            }
            var self = this;
            if (!self.myClassInst) {
                self.evtCreate.attachOnce(function () { return callee.apply(_this, inputs); });
                return;
            }
            self.myClassInst.myMethod.apply(self.myClassInst, inputs);
        });
        setTimeout(function () {
            _this.myClassInst = new MyClass();
            _this.evtCreate.post();
        }, 1000);
    }
    MyClassProxy.prototype.getAlphabet = function () {
        if (!this.myClassInst)
            return "";
        else
            return this.myClassInst.alphabet;
    };
    return MyClassProxy;
}());
exports.MyClassProxy = MyClassProxy;
var inst = new MyClassProxy();
setTimeout(function () {
    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 3);
    console.assert(inst.getAlphabet() === "ab");
    runExclusive.cancelAllQueuedCalls(inst.myMethod, inst);
    setTimeout(function () {
        console.assert(inst.getAlphabet() === "abc");
        console.log("PASS");
    }, 2000);
}, 2900 + 1000);
console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);
inst.myMethod("a");
console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);
for (var _i = 0, _a = ["b", "c", "d", "e", "f"]; _i < _a.length; _i++) {
    var char = _a[_i];
    inst.myMethod(char, function (alphabet) { return console.log("step " + alphabet); });
}
console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 5);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);
//# sourceMappingURL=test12.js.map