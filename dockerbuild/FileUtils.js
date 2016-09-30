"use strict";
const path = require("path");
function fileName(filePath) {
    return (filePath) ? path.basename(filePath, extension(filePath)) : null;
}
exports.fileName = fileName;
function extension(filePath, fallback) {
    let indexOfDot = (filePath) ? filePath.lastIndexOf(".") : -1;
    return (indexOfDot >= 0) ? filePath.substr(filePath.lastIndexOf(".")) : fallback;
}
exports.extension = extension;
//# sourceMappingURL=FileUtils.js.map