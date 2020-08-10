"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var groupRefAlphabet = runExclusive.createGroupRef();
var MyClass1 = /** @class */ (function () {
    function MyClass1() {
        var _this = this;
        this.alphabet = "";
        this.myMethod = runExclusive.buildCb(groupRefAlphabet, function (char, wait, callback) {
            setTimeout(function () {
                _this.alphabet += char.toUpperCase();
                callback(_this.alphabet);
            }, wait);
        });
    }
    ;
    return MyClass1;
}());
var MyClass2 = /** @class */ (function () {
    function MyClass2() {
        var _this = this;
        this.alphabet = "";
        this.myMethod = runExclusive.buildCb(groupRefAlphabet, function (char, wait, callback) {
            setTimeout(function () {
                _this.alphabet += char;
                callback(_this.alphabet);
            }, wait);
        });
    }
    ;
    return MyClass2;
}());
var start = Date.now();
var inst1 = new MyClass1();
inst1.myMethod("a", 1000, function (alphabet) { return console.log(alphabet); });
inst1.myMethod("b", 1000, function (alphabet) { return console.log(alphabet); });
var inst2 = new MyClass2();
var rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
var wait = 500;
for (var _i = 0, rev_1 = rev; _i < rev_1.length; _i++) {
    var char = rev_1[_i];
    inst2.myMethod(char, wait, function (alphabet) { return console.log(alphabet); });
}
inst2.myMethod("a", wait, function () {
    //cSpell: disable
    console.assert(this.alphabet === "nmlkjihgfedcba");
    //cSpell: enable
});
inst1.myMethod("c", 1000, function (alphabet) { return console.log(alphabet); });
inst1.myMethod("d", 1000, function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(inst1.alphabet === "ABCD");
    //cSpell: enable
    var expectedDuration = 1000 * 4 + (rev.length + 1) * 500;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
    console.log("PASS");
});
//# sourceMappingURL=test6.js.map