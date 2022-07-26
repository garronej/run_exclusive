"use strict";
exports.__esModule = true;
for (var i = 1; i <= 21; i++) {
    try {
        require("./test" + i);
    }
    catch (error) {
        console.log("Fail test " + i);
        throw error;
    }
}
//# sourceMappingURL=index.js.map