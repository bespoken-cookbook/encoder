// / <reference path="./typings/node.d.ts" />
import * as encoder from "../main/serverEncoder"
import * as fs from "fs";

describe("ServerEncoder", () => {
    
    describe("createFolder", () => {
        it("Will create a temp folder in specified location without error.", (done: MochaDone) => {
            encoder.Encoder.createFolder("testFolder/", (err: NodeJS.ErrnoException) => {
                if (err) {
                    done(err);
                } else {
                    done(verifyFile("testFolder/", fs.constants.F_OK));
                    fs.rmdirSync("testFolder/");
                }
            });
        });
    });

    describe("downloadAndEncode", () => {
        it("Checks that a file is downloaded and encoded to a readable temporary mp3 without error.", (done: MochaDone) => {
            encoder.Encoder.downloadAndEncode("https://d2mxb5cuq6ityb.cloudfront.net/Demo-Geico.m4a", (err: Error, outputPath: string) => {
                if (err) {
                    done(err);
                } else {
                    done(verifyFile(outputPath, fs.constants.F_OK | fs.constants.W_OK));
                    fs.unlinkSync(outputPath);
                }
            });
        });
    });

    function verifyFile(path: string, mode: number): Error {
        try {
            fs.accessSync(path, mode);
        } catch(e) {
            return e;
        }
    }
});