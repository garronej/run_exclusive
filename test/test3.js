"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var runExclusive = require("../lib/runExclusive");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.alphabet = "";
        this.myMethod = runExclusive.buildMethod(runExclusive.createGroupRef(), function (char, wait) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, wait); })];
                    case 1:
                        _a.sent();
                        this.alphabet += char;
                        return [2 /*return*/, this.alphabet];
                }
            });
        }); });
    }
    ;
    return MyClass;
}());
var start = Date.now();
var inst1 = new MyClass();
inst1.myMethod("a", 1000).then(function (alphabet) { return console.log(alphabet); });
inst1.myMethod("b", 1000).then(function (alphabet) { return console.log(alphabet); });
var inst2 = new MyClass();
var rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
var wait = 500;
for (var _i = 0, rev_1 = rev; _i < rev_1.length; _i++) {
    var char = rev_1[_i];
    inst2.myMethod(char, wait).then(function (alphabet) { return console.log(alphabet); });
}
inst2.myMethod("a", wait).then(function () {
    var duration = Date.now() - start;
    //cSpell: disable
    console.assert(inst2.alphabet === "nmlkjihgfedcba");
    //cSpell: enable
    var expectedDuration = (rev.length + 1) * 500;
    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);
    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);
    console.log("PASS");
});
inst1.myMethod("c", 1000).then(function (alphabet) { return console.log(alphabet); });
inst1.myMethod("d", 1000).then(function () {
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
//# sourceMappingURL=test3.js.map