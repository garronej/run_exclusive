"use strict";
exports.__esModule = true;
process.on("unhandledRejection", function (error) {
    console.log("INTERNAL ERROR");
    console.log(error);
    throw error;
});
var n = process.argv[2];
if (n) {
    require("./test" + n);
}
else {
    require("./legacyTests/index");
    for (var i = 1; i <= 18; i++) {
        try {
            require("./test" + i);
        }
        catch (error) {
            console.log("Fail test " + i);
            throw error;
        }
    }
}
//# sourceMappingURL=index.js.map