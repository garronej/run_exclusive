"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
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
var MyClassProxy = /** @class */ (function () {
    function MyClassProxy() {
        var _this = this;
        this.myClassInst = new MyClass();
        this.callCount = 0;
        this.myMethod = runExclusive.buildMethodCb(function () {
            var inputs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                inputs[_i] = arguments[_i];
            }
            _this.callCount++;
            return _this.myClassInst.myMethod.apply(_this.myClassInst, inputs);
        });
    }
    ;
    MyClassProxy.prototype.getAlphabet = function () {
        return this.myClassInst.alphabet;
    };
    return MyClassProxy;
}());
var inst = new MyClassProxy();
setTimeout(function () {
    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 3);
    console.assert(inst.getAlphabet() === "ab");
    runExclusive.cancelAllQueuedCalls(inst.myMethod, inst);
    setTimeout(function () {
        console.assert(inst.getAlphabet() === "abc");
        console.log("PASS");
    }, 2000);
}, 2900);
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
console.assert(inst.callCount === 1);
//# sourceMappingURL=test11.js.map