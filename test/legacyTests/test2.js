"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabetStack = "";
        this.groupRef = runExclusive.createGroupRef();
        this.myMethodUpperCase = runExclusive.buildMethodCb(this.groupRef, function (char, callback) {
            setTimeout(function () {
                _this.alphabetStack += char.toUpperCase();
                callback(_this.alphabetStack);
            }, Math.random() * 1000);
        });
        this.myMethod = runExclusive.buildMethodCb(this.groupRef, function (char, callback) {
            setTimeout(function () {
                _this.alphabetStack += char;
                callback(_this.alphabetStack);
            }, Math.random() * 1000);
        });
    }
    ;
    return MyClass;
}());
var inst = new MyClass();
inst.myMethod("a");
for (var _i = 0, _a = ["b", "c", "d", "e", "f"]; _i < _a.length; _i++) {
    var char = _a[_i];
    inst.myMethodUpperCase(char, function (alphabet) { return console.log("step " + alphabet); });
}
for (var _b = 0, _c = ["g", "h", "i"]; _b < _c.length; _b++) {
    var char = _c[_b];
    inst.myMethod(char, function (alphabet) { return console.log("step " + alphabet); });
}
inst.myMethod("j", function (alphabet) {
    console.log("completed " + alphabet);
    //cSpell: disable
    console.assert(alphabet === "aBCDEFghij");
    //cSpell: enable
    console.log("PASS");
});
//# sourceMappingURL=test2.js.map