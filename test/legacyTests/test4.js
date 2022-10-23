"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabet = "";
        this.myMethod = runExclusive.buildMethodCb(function (char, wait, callback) {
            setTimeout(function () {
                _this.alphabet += char;
                callback(_this.alphabet);
            }, wait);
        });
    }
    ;
    return MyClass;
}());
var start = Date.now();
var inst1 = new MyClass();
inst1.myMethod("a", 1000, function (alphabet) { return console.log(alphabet); });
inst1.myMethod("b", 1000, function (alphabet) { return console.log(alphabet); });
var inst2 = new MyClass();
var rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
var wait = 500;
for (var _i = 0, rev_1 = rev; _i < rev_1.length; _i++) {
    var char = rev_1[_i];
    inst2.myMethod(char, wait, function (alphabet) { return console.log(alphabet); });
}
inst2.myMethod("a", wait, function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(this.alphabet === "nmlkjihgfedcba");
    //cSpell: enable
    var expectedDuration = (rev.length + 1) * wait;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
    console.log("PASS");
});
inst1.myMethod("c", 1000, function (alphabet) { return console.log(alphabet); });
inst1.myMethod("d", 1000, function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(inst1.alphabet === "abcd");
    //cSpell: enable
    var expectedDuration = 1000 * 4;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
});
//# sourceMappingURL=test4.js.map