/// <reference path="../typings/globals/node/node.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
import * as path from "path";
import * as file from "../main/FileUtils";

const filePath: string = path.sep + "full" + path.sep + "path" + path.sep + "to" + path.sep + "file" + path.sep;
const fileName: string = "fullFileName";
const fileExtension: string = ".txt";
const fallbackExtension: string = ".raw";
const fileNameWithExtension: string = fileName + fileExtension;
const fullFilePath: string = filePath + fileNameWithExtension;
const fullFileWithoutExtension: string = filePath + fileName;

describe('FileUtils', () => {
    
    describe("#fileNameFullPath", () => {
        it("Retrieve the file name from a full path.", () => {
            var result: string = file.fileName(fullFilePath);
            if (result != fileName) {
                throw Error("Expected was " + fileName + " and got " + result);
            }
        });
    });

    describe("#fileNameNull", () => {
        it("Check that a null is returned when passing in a null.", () => {
            var result: string = file.fileName(null);
            if (result != null) {
                throw Error("Expected it to return null but " + result + " was returned.");
            }
        });
    });

    describe("#fileNameNoExtention", () => {
        it("Check that the file name is returned when there is no extension.", () => {
            var result: string = file.fileName(fullFileWithoutExtension);
            if (result != fileName) {
                throw Error("Expected " + fileName + " and got " + result);
            }
        });
    });

    describe("#fileNameNoPath", () => {
        it("Check that the file name is returned when there is no extension.", () => {
            var result: string = file.fileName(fileNameWithExtension);
            if (result != fileName) {
                throw Error("Expected " + fileName + " and got " + result);
            }
        });
    });

    describe("#extensionFull", () => {
        it("Check that the file extension is returned in full.", () => {
            var result: string = file.extension(fullFilePath, fallbackExtension);
            if (result != fallbackExtension) {
                throw Error("Expected " + fileExtension + " and got " + result);
            }
        });
    });

    describe("#extensionFallback", () => {
        it("Check that the file extension is returned if no extension is present.", () => {
            var result: string = file.extension(fullFileWithoutExtension, fallbackExtension);
            if (result != fallbackExtension) {
                throw Error("Expected " + fallbackExtension + " and got " + result);
            }
        });
    });
})