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
var inst = new MyClass();
setTimeout(function () {
    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 3);
    console.assert(inst.alphabet === "ab");
    runExclusive.cancelAllQueuedCalls(inst.myMethod, inst);
    setTimeout(function () {
        console.assert(inst.alphabet === "abc");
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
//# sourceMappingURL=test10.js.map