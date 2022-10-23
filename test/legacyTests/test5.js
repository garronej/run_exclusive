"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabet = "";
        this.myMethod = runExclusive.buildMethodCb(MyClass.groupRef, function (char, wait, callback) {
            setTimeout(function () {
                _this.alphabet += char;
                callback(_this.alphabet);
            }, wait);
        });
    }
    ;
    MyClass.groupRef = runExclusive.createGroupRef();
    return MyClass;
}());
var start = Date.now();
var inst1 = new MyClass();
inst1.myMethod.call(MyClass, "a", 1000, function (alphabet) { return console.log(alphabet); });
inst1.myMethod.call(MyClass, "b", 1000, function (alphabet) { return console.log(alphabet); });
var inst2 = new MyClass();
var rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
var wait = 500;
for (var _i = 0, rev_1 = rev; _i < rev_1.length; _i++) {
    var char = rev_1[_i];
    inst2.myMethod.call(MyClass, char, wait, function (alphabet) { return console.log(alphabet); });
}
inst2.myMethod.call(MyClass, "a", wait, function () {
    //cSpell: disable
    console.assert(inst2.alphabet === "nmlkjihgfedcba");
    //cSpell: enable
});
inst1.myMethod.call(MyClass, "c", 1000, function (alphabet) { return console.log(alphabet); });
inst1.myMethod.call(MyClass, "d", 1000, function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(inst1.alphabet === "abcd");
    //cSpell: enable
    var expectedDuration = 1000 * 4 + (rev.length + 1) * wait;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
    console.log("PASS");
});
//# sourceMappingURL=test5.js.map