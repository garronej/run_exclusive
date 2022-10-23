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
console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === false);
inst.myMethod("a", function () {
    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
    console.assert(runExclusive.isRunning(inst.myMethod, inst) === true);
    console.log("PASS");
});
inst.myMethod("b");
//# sourceMappingURL=test14.js.map