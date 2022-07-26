"use strict";
exports.__esModule = true;
exports.MyClass = void 0;
var runExclusive = require("../../lib/runExclusive");
var evt_1 = require("evt");
var MyClass = /** @class */ (function () {
    function MyClass() {
        var _this = this;
        this.evtNoCallback = new evt_1.Evt();
        this.myMethod = runExclusive.buildMethodCb(function (message, callback) {
            if (!callback.hasCallback)
                _this.evtNoCallback.post(message);
            callback(message);
        });
    }
    ;
    return MyClass;
}());
exports.MyClass = MyClass;
var inst = new MyClass();
var success = false;
inst.evtNoCallback.attach(function (message) {
    console.assert(message === "noCallback");
    success = true;
});
inst.myMethod("noCallback");
inst.myMethod("callback", function (message) { return console.assert("callback" === message); });
console.assert(success);
console.log("DONE");
//# sourceMappingURL=test18.js.map