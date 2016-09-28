// / <reference path="./typings/node.d.ts" />
// / <reference path="./typings/tmp.d.ts" />
// / <reference path="./typings/aws-sdk.d.ts" />
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";
import * as cprocess from "child_process";
import * as aws from "aws-sdk";

export module Encoder {
    export function encode(musicSourceUrl: string, targetBucket: string, targetKey: string, accessKeyId: string, accessSecret: string, callback: (err: Error, url: String) => void) {
        console.info('Encoder created.');
            console.log("sourceUrl: " + musicSourceUrl +
                "\n targetBucket: " + targetBucket +
                "\n targetKey: " + targetKey +
                "\n accessKeyId: " + accessKeyId +
                "\n accessSecret: " + accessSecret);

            downloadAndEncode(musicSourceUrl, function (err: Error, mp3file: string) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("File has been converted.");
                    aws.config.update( {
                        accessKeyId: accessKeyId,
                        secretAccessKey: accessSecret
                    });
                    sendOffToBucket(mp3file, targetBucket, targetKey, function(err: Error, url: string) {
                        fs.unlink(mp3file);
                        callback(err, url);
                    });
                }
            })
    };

    function sendOffToBucket(fileUri: string, bucket: string, bucketKey: string, callback: (err: Error, url: string) => void) {
        console.info("sending " + fileUri + " to " + bucket + " with key " + bucketKey);
        fs.readFile(fileUri, {encoding: null}, function(err: NodeJS.ErrnoException, data: string) {
            var s3: aws.S3 = new aws.S3();
            var params: aws.s3.PutObjectRequest = {Bucket: bucket, Key: bucketKey, Body: data, ACL: 'public-read'};
            s3.putObject(params, function(err: Error, data: any) {
                if (err) {
                    console.error(err.message);
                    callback(err, null);
                    return;
                }
                s3.getSignedUrl('putObject', {Bucket: bucket, Key: bucketKey}, function(err: Error, url: string) {
                    // The signed URL gives a bunch of parameters that includes the signature and Access key which we very much do not want.
                    var stripped: string = stripQueryAndFragments(url);
                    callback(err, stripped);
                });
            });
        })
    }

    export function downloadAndEncode(sourceUrl: string, callback: (err: Error, outputPath: string) => void) {
        saveTempFile(sourceUrl, function(fileUri: string, error: Error) {
            if (error) {
                callback(error, null);
            } else {
                convertFile(fileUri, function(outputPath: string, error: Error) {
                    fs.unlink(fileUri);
                    callback(error, outputPath);
                });
            }
        });
    }

    export function convertFile(inputFile: string, callback: (outputFile: string, err: Error) => void) {
        // Retrieving a tmp name for the outputPath.
        var options: tmp.FileOptions = {
            postfix: ".mp3"
        }

        tmp.tmpName(options, function(error: Error, outputPath: string) {
            if (error) {
                callback(null, error);
                return;
            }

            console.info("Converting " + inputFile + " to " + outputPath);

            // This is the codec that Amazon suggests regarding the encoding.
            cprocess.execFile('ffmpeg', ['-i', inputFile, '-codec:a', 'libmp3lame', '-b:a', '48k', '-ar', '16000', '-af', 'volume=3', outputPath],
                function(error: Error, stdout: string, stderr: string) {
                    console.info("Converted wiht error? " + (error != null));
                    callback(outputPath, error);
                });
        });
    }

    function saveTempFile(fileUrl: string, callback: (fileUri: string, err: Error) => void) {
        var postfix: string = getExtension(fileUrl, ".tmp");
        var options: tmp.FileOptions = {
            postfix: getExtension(fileUrl, ".tmp"),
            keep: true
        }

        tmp.file(options, function (err: Error, inputPath: string, fileDescriptor: number) {
            console.info("File created at " + inputPath);
            var file: fs.WriteStream = fs.createWriteStream(inputPath);

            networkGet(fileUrl, function (response: http.IncomingMessage) {
                if (response.statusCode == 200) {
                    try {
                        console.info("Piping to file.");
                        response.pipe(file);

                        file.on('finish', function() {
                            file.close();
                            console.info("File piped.");
                            callback(inputPath, null);
                        })
                    } catch (e) {
                        callback(null, e);
                    }
                } else {
                    callback(null, Error("Could not retrieve file from " + fileUrl));
                }
            });
        })
    }

    function networkGet(fileUrl: string, callback: (response: http.IncomingMessage) => void) {
        var isSecure: Boolean = fileUrl.startsWith("https");
        if (isSecure) {
            https.get(fileUrl, callback);
        } else {
            http.get(fileUrl, callback);
        }
    }

    export function createFolder(path: string, callback: (err: NodeJS.ErrnoException) => void) {
        fs.mkdir(path, function (err: NodeJS.ErrnoException) {
            var callbackErr: NodeJS.ErrnoException = err;
            if (err) {
                if (err.code == 'EEXIST') {
                    // Error because the folder already exist. So what? Who cares? Throw out.
                    callbackErr = null;
                }
            }
            callback(callbackErr);
        });
    }

    function fullNetworkFileName(url: string): string {
        return url.substr(url.lastIndexOf("/"));
    }

    function getFileName(url: string, seperator: string): string {
        var lastPath: string = url.substr(url.lastIndexOf(seperator), url.lastIndexOf("."));
        return lastPath;
    }

    function getExtension(url: string, fallback: string): string {
        var extension: string = (url) ? url.substr(url.lastIndexOf(".")) : "";
        if (extension.length == 0) {
            extension = fallback;
        }
        return extension;
    }

    function stripQueryAndFragments(url: string) {
        return (url) ? url.substr(0, url.indexOf("?")) : url;
    }
}