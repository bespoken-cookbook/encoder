// / <reference path="./typings/node.d.ts" />
import * as encoder from "../main/serverEncoder"
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as assert from "assert";
import * as https from "https";

const TEST_FOLDER: string = "testFolder" + path.sep;
const AUDIO_FILE: string = __dirname + path.sep + "assets" + path.sep + "audio.m4a";
const IMAGE_FILE: string = __dirname + path.sep + "assets" + path.sep + "img.png";
const AUDIO_URL: string = "https://d2mxb5cuq6ityb.cloudfront.net/Demo-Geico.m4a";
const IMAGE_URL: string = "https://xapp-wpengine.netdna-ssl.com/wp-content/themes/xapp/assets/images/logo.png";

const TEST_BUCKET: string = "bespoken/encoder/test";
const TEST_PUBLIC_BUCKET: string = "bespoken/encoder/test";

/**
 * Unit and integration tests for the ServerEncoder scope.  This requires aws keys in order to
 * run. It will take the credentials from the aws cli from the "~/.aws" folder.  Currently it
 * will only take the default one. Multiple profile support would need to be added. 
 */
describe("ServerEncoder", () => {
    var TEST_KEY: string = "testKey.mp3";
    var ACCESS_ID: string = "";
    var SECRET: string = "";

    before(function() {
        try {
            var homeDirectory: string = os.homedir();
            var configsString: string = fs.readFileSync(homeDirectory + "/.aws/credentials", "utf8");
            var configs: Map<string, string> = parseCreds("default", configsString);
            ACCESS_ID = configs.get("aws_access_key_id");
            SECRET = configs.get("aws_secret_access_key");
        } catch(e) {
            console.error(e);
            throw Error("Unable to find aws credentials.  Please install and configure aws cli to run these tests.")
        }
    })

    describe("encoder", () => {
        it("Tests the full \"encoder\" method with valid input to ensure that the file has been sent to the S3 bucket.", (done: MochaDone) => {
            encoder.Encoder.encode(AUDIO_URL, TEST_BUCKET, TEST_KEY, ACCESS_ID, SECRET, (err: Error, url: String) => {
                if (err) {
                    done(err);
                } else {
                    if (url == null) {
                        done(Error("Url provided was null when no error was thrown."));
                    } else {
                        assert.equal(url, "https://s3.amazonaws.com/" + TEST_BUCKET + "/" + TEST_KEY);
                        done();
                    }
                }
            });
        });

        it("Tests the full \"encoder\" method with valid input to ensure that the file has been sent to the public S3 bucket.", (done: MochaDone) => {
            encoder.Encoder.encode(AUDIO_URL, TEST_PUBLIC_BUCKET, TEST_KEY, null, null, (err: Error, url: String) => {
                if (err) {
                    done(err);
                } else {
                    if (url == null) {
                        done(Error("Url provided was null when no error was thrown."));
                    } else {
                        assert.equal(url, "https://s3.amazonaws.com/" + TEST_PUBLIC_BUCKET + "/" + TEST_KEY);
                        done();
                    }
                }
            });
        });

        it("Tests the full \"encoder\" method with a bad URL.  It should return an error with no URL.", (done: MochaDone) => {
            encoder.Encoder.encode(IMAGE_URL, TEST_BUCKET, TEST_KEY, ACCESS_ID, SECRET, (err: Error, url: String) => {
                if (err != null) {
                    if (url) {
                        done(Error("A url of " + url + " was returned when \"null\" was expected."));
                    } else {
                        done();
                    }
                } else {
                    done(Error("No error was thrown and a url of " + url + " was returned."));
                }
            });
        });

        it("Tests the full \"encoder\" will throw an error with bad credentials to a private repo.", (done: MochaDone) => {
            encoder.Encoder.encode(AUDIO_URL, TEST_BUCKET, TEST_KEY, ACCESS_ID, "12345", (err: Error, url: String) => {
                if (err) {
                    if (url) {
                        done(Error("An error was thrown but the URL was still return as " + url));
                    } else {
                        done();
                    }
                } else {
                    done(Error("No error was thrown and a url of " + url + " was returned."));
                }
            });
        });
    });

    describe("convertFile", () => {
        it("Converts a valid audio file to a valid MP3 file without error.", (done: MochaDone) => {
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


        it("Attempts to convert an image file to a music file. It should fail and throw an error with no output path.", (done: MochaDone) => {
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
        it("Checks that an audio file is downloaded and encoded to a readable temporary mp3 without error.", (done: MochaDone) => {
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

        it("Checks that a file is not downloaded or encoded if it is not a suitable type. It must produce an error.", (done: MochaDone) => {
            encoder.Encoder.downloadAndEncode(IMAGE_URL, (err: Error, outputPath: string) => {
                if (!err) {
                    done(Error("There was no error produced when there should have been. OutputPath = " + outputPath));
                } else {
                    assert.equal(outputPath, null, "An output path was produced when it should have been null: OutputPath = " + outputPath);
                    done();
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

    /**
     * Simple method that parses the aws credentials file in to a map.
     * It only supports the credentials like so:
     * 
     * [profile]
     * "key" = "value"
     * "key2" = "value2"
     */
    function parseCreds(profile: string, creds: string): Map<string, string> {
        let map: Map<string, string> = new Map<string, string>();
        
        let lines: string[] = creds.split(os.EOL);

        for (var i = 0; i < lines.length; ++i) {
            if (lines[i].trim().match("^\[" + profile + "\]")) {
                if (lines[i].trim().match(/^\w+\s*=\s*\w+/)) {
                    let split: string[] = lines[i].split("=");
                    map.set(split[0].trim(), split[1].trim());
                }
                break;
            }
        }
        return map;
    }
});