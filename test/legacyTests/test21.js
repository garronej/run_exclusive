"use strict";
exports.__esModule = true;
var runExclusive = require("../../lib/runExclusive");
var runExclusiveFunction = runExclusive.buildCb(function (callback) { return callback(); });
var cbTriggered = false;
runExclusiveFunction(function () { return cbTriggered = true; });
console.assert(cbTriggered);
console.log("PASS");
//# sourceMappingURL=test21.js.map