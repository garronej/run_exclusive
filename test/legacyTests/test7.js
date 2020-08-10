"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabet = "";
        this.myMethod1 = runExclusive.buildMethodCb(runExclusive.createGroupRef(), function (char, wait, callback) {
            setTimeout(function () {
                _this.alphabet += char;
                callback(_this.alphabet);
            }, wait);
        });
        this.alphabet2 = "";
        this.myMethod2 = runExclusive.buildMethodCb(function (char, wait, callback) {
            var safeCallback = callback || function () { };
            setTimeout(function () {
                _this.alphabet2 += char;
                safeCallback(_this.alphabet2);
            }, wait);
        });
    }
    ;
    return MyClass;
}());
var start = Date.now();
var inst = new MyClass();
inst.myMethod1("a", 1000, function (alphabet) { return console.log(alphabet); });
inst.myMethod1("b", 1000, function (alphabet) { return console.log(alphabet); });
var rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
var wait = 500;
for (var _i = 0, rev_1 = rev; _i < rev_1.length; _i++) {
    var char = rev_1[_i];
    inst.myMethod2(char, wait, function (alphabet) { return console.log(alphabet); });
}
inst.myMethod2("a", wait, function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(this.alphabet2 === "nmlkjihgfedcba");
    //cSpell: enable
    var expectedDuration = (rev.length + 1) * wait;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
    console.log("PASS");
});
inst.myMethod1("c", 1000, function (alphabet) { return console.log(alphabet); });
inst.myMethod1("d", 1000, function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(inst.alphabet === "abcd");
    //cSpell: enable
    var expectedDuration = 1000 * 4;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
});
//# sourceMappingURL=test7.js.map