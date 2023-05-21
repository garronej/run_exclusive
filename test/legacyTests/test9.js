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
for (var _i = 0, _a = ["a", "b", "c", "d", "e", "f"]; _i < _a.length; _i++) {
    var char = _a[_i];
    inst.myMethod(char, function (alphabet) { return console.log("step " + alphabet); });
}
//# sourceMappingURL=test9.js.map