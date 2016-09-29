// / <reference path="./typings/node.d.ts" />
import * as encoder from "../main/serverEncoder"
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";

const TEST_FOLDER: string = "testFolder" + path.sep;
const AUDIO_FILE: string = __dirname + path.sep + "assets" + path.sep + "audio.m4a";
const IMAGE_FILE: string = __dirname + path.sep + "assets" + path.sep + "img.png";
const AUDIO_URL: string = "https://d2mxb5cuq6ityb.cloudfront.net/Demo-Geico.m4a";
const IMAGE_URL: string = "https://xapp-wpengine.netdna-ssl.com/wp-content/themes/xapp/assets/images/logo.png";

describe("ServerEncoder", () => {
    
    describe("createFolder", () => {
        it("Will create a temp folder in specified location without error.", (done: MochaDone) => {
            encoder.Encoder.createFolder(TEST_FOLDER, (err: NodeJS.ErrnoException) => {
                if (err) {
                    done(err);
                } else {
                    done(verifyFile(TEST_FOLDER, fs.constants.F_OK));
                    fs.rmdirSync(TEST_FOLDER);
                }
            });
        });
    });

    describe("convertFile", () => {
        it("Will convert " + AUDIO_FILE + " to a valid MP3 file without error.", (done: MochaDone) => {
            encoder.Encoder.convertFile(AUDIO_FILE, (err: Error, outputPath: string) => {
                if (err) {
                    done(err);
                } else {
                    done(verifyFile(outputPath, fs.constants.F_OK));
                }
                if (outputPath) {
                    fs.unlinkSync(outputPath);
                }
            });
        });
    });

    describe("convertFile with wrong image type", () => {
        it("Will attempt to convert an image file to a music file. It should fail and throw an error with no output path.", (done: MochaDone) => {
            encoder.Encoder.convertFile(IMAGE_FILE, (err: Error, outputPath: string) => {
                if (!err) {
                    done(Error("An error was supposed to be thrown but was not thrown."));
                } else {
                    assert.equal(outputPath, null, "An output path of " + outputPath + " was produced when it should have been null.");
                    done();
                }
                if (outputPath) {
                    fs.unlinkSync(outputPath);
                }
            });
        });
    });

    describe("downloadAndEncode", () => {
        it("Checks that a file is downloaded and encoded to a readable temporary mp3 without error.", (done: MochaDone) => {
            encoder.Encoder.downloadAndEncode(AUDIO_URL, (err: Error, outputPath: string) => {
                if (err) {
                    done(err);
                } else {
                    done(verifyFile(outputPath, fs.constants.F_OK | fs.constants.W_OK));
                }
                if (outputPath) {
                    fs.unlinkSync(outputPath);
                }
            });
        });
    });

    describe("downloadAndEncode with a bad file", () => {
        it("Checks that a file is not downloaded or encoded if it is not a suitable type. It must produce an error.", (done: MochaDone) => {
            encoder.Encoder.downloadAndEncode(IMAGE_URL, (err: Error, outputPath: string) => {
                if (!err) {
                    done(Error("There was no error produced when there should have been. OutputPath = " + outputPath));
                } else {
                    assert.equal(outputPath, null, "An output path was produced when it should have been null: OutputPath = " + outputPath);
                    done();
                }
            })
        })
    })

    function verifyFile(path: string, mode: number): Error {
        try {
            fs.accessSync(path, mode);
        } catch(e) {
            return e;
        }
    }
});