"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabetStack = "";
        this.myMethodStack = runExclusive.buildMethodCb(function (char, callback) {
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
for (var _i = 0, _a = ["a", "b", "c", "d", "e", "f"]; _i < _a.length; _i++) {
    var char = _a[_i];
    inst.myMethodStack(char, function (alphabet) { return console.log("step " + alphabet); });
}
for (var _b = 0, _c = ["g", "h", "i"]; _b < _c.length; _b++) {
    var char = _c[_b];
    inst.myMethodStack(char);
}
inst.myMethodStack("j", function (alphabet) {
    console.log("completed " + alphabet);
    //cSpell: disable
    console.assert(alphabet === "abcdefghij");
    //cSpell: enable
    console.log("PASS");
});
//# sourceMappingURL=test1.js.map