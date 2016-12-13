/// <reference path="../typings/index.d.ts" />
import * as http from "http";
import * as request from "request";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";
import * as cprocess from "child_process";
import * as aws from "aws-sdk";

export namespace Encoder {

    /**
     * Parameter interface to use for the full `encode` method.
     * 
     * @param sourceUrl: The remote URL to the audio file to encode.
     * @param targetBucket: Amazon S3 bucket to send the encoded audio to.
     * @param targetKey: Name of the encoded file.
     * @param accessKeyId: The access ID for the S3 bucket. Optional.
     * @param accessSecret: The access Secret for the S3 bucket. Optional.
     * @param region: The region for the S3 bucket.  Optional.  Will default to "us-east-1"
     */
    export interface Params {
        sourceUrl: string;
        filterVolume: number;
        targetBucket: string;
        targetKey: string;
        accessKeyId: string;
        accessSecret: string;
    }

    /**
     * A method that will encode the audio file at the given remote URL, encode it to an Amazon Echo compatiable audio file, then
     * send it off to the given Amazon S3 bucket with the given targetKey for the name.
     * 
     * @param params: The parameters for the encoding. 
     * @param callback: Callback to retrieve the error or the remote URL to the encoded audio.
     *
     */
    export function encode(params: Params, callback: (err: Error, url: String) => void) {
            downloadAndEncode(params, function (err: Error, mp3file: string) {
                if (err != null) {
                    callback(err, null);
                } else {
                    sendOffToBucket(mp3file, params, function(err: Error, url: string) {
                        fs.unlink(mp3file, (err: NodeJS.ErrnoException) => {
                            if (err) {
                                console.error("Unable to delete mp3 file " + mp3file + ". Err message: " + err.message);
                            }
                        });
                        callback(err, url);
                    });
                }
            });
    };

    /**
     * Sends the file at the given path off to the specified Amazon S3 bucket.
     * 
     * @param fileUri: The file location of the file to upload.
     * @param params: The parameters for the encoding
     * @param callback: Callback to receive  the URL to the item uploaded or an error if one occurred.
     */
    export function sendOffToBucket(fileUri: string, params: Params, callback: (err: Error, url: string) => void) {
        fs.readFile(fileUri, {encoding: null}, function(err: NodeJS.ErrnoException, data: string) {
            // We want to set our credentials as "locally" as possible, so they don't get reused
            let s3: aws.S3 = new aws.S3({
                accessKeyId: params.accessKeyId,
                secretAccessKey: params.accessSecret
            });
            let putParams: aws.s3.PutObjectRequest = { Bucket: params.targetBucket, Key: params.targetKey, Body: data, ACL: "public-read"};
            s3.putObject(putParams, function(err: Error, data: any) {
                if (err) {
                    callback(err, null);
                    return;
                }
                let url: string = urlForKey(params.targetBucket, params.targetKey);
                callback(err, url);
            });
        });
    }

    /**
     * Method that will download the file at the given URL and save it to a temporary file.
     * 
     * @param params: The params for the encoding
     * @param callback: Callback to retrieve the outputPath to the saved temp file or an error if one occurred. 
     */
    export function downloadAndEncode(params: Params, callback: (err: Error, outputPath: string) => void) {
        saveTempFile(params.sourceUrl, function(error: Error, fileUri: string) {
            if (error) {
                callback(Error("Unable to download and save file at path " + params.sourceUrl + ". Error: " + error.message), null);
            } else {
                convertFile(fileUri, params, function(error: Error, outputPath: string) {
                    fs.unlink(fileUri, (err: NodeJS.ErrnoException) => {
                        if (err) {
                            console.error("Unable to delete file " + fileUri + ". Error message: " + err.message);
                        }
                    });
                    callback(error, outputPath);
                });
            }
        });
    }

    /**
     * Converts an audio file at the provided path to the Amazon Echo approved MP3 file.
     * 
     * @param inputFile: File path to the audio file.
     * @param params: The parameters for the encoding
     * @param callback: Callback to retrieve the outputFile path pointing to the encoded file or an error.
     */
    export function convertFile(inputFile: string, params: Params, callback: (err: Error, outputFile: string) => void) {
        let normalizedPath: string = path.normalize(inputFile);

        // Retrieving a tmp name for the outputPath.
        let options: tmp.SimpleOptions = {
            postfix: ".mp3"
        };

        let filterVolume = 1.0;
        if (params && params.filterVolume) {
            filterVolume = params.filterVolume;
        }

        tmp.tmpName(options, function(error: Error, outputPath: string) {
            if (error) {
                callback(error, null);
                return;
            }

            // This is the codec that Amazon suggests regarding the encoding.
            cprocess.execFile("ffmpeg", ["-i", normalizedPath, "-codec:a", "libmp3lame", "-b:a", "48k", "-ar", "16000", "-af", "volume=" + filterVolume, outputPath],
                function(error: Error, stdout: string, stderr: string) {
                    if (error) {
                        fs.unlink(outputPath, (error: NodeJS.ErrnoException) => {
                            if (error) {
                                console.error("Unable to delete " + outputPath + ". Full error: " + error.message);
                            }
                        });
                        outputPath = null;
                    }
                    if (error) {
                        console.error("Error thrown: " + error.message);
                        error = Error("Unable to encode the file to mp3.");
                    }
                    callback(error, outputPath);
                });
        });
    }

    /**
     * Download a remote file and save it locally to a temp file.
     * 
     * @param fileUrl: The remote URL to the file to retrieve.
     * @param callback: Callback to retrieve the local location of the file or an error if one occurred. 
     */
    function saveTempFile(fileUrl: string, callback: (err: Error, fileUri: string) => void) {
        let postfix: string = getExtension(fileUrl, ".tmp");
        let options: tmp.SimpleOptions = {
            postfix: getExtension(fileUrl, ".tmp"),
            keep: true
        };

        tmp.file(options, function (err: Error, inputPath: string, fileDescriptor: number) {
            let file: fs.WriteStream = fs.createWriteStream(inputPath);

            let positive = function (response: http.IncomingMessage) {
                if (response.statusCode === 200) {
                    try {
                        response.pipe(file);

                        file.on("finish", function() {
                            file.close();
                            callback(null, inputPath);
                        });
                    } catch (e) {
                        console.error("Error thrown: " + e.message);
                        callback(e, null);
                    }
                } else {
                    callback(Error("Could not retrieve file from " + fileUrl), null);
                }
            };

            let negative = function(error: Error) {
                if (error) {
                    console.error("Error thrown: " + error.message);
                }
                callback(error, null);
            };

            networkGet(fileUrl, positive, negative);
        });
    }

    function networkGet(fileUrl: string, callback: (response: http.IncomingMessage) => void, errorCallback: (error: Error) => void) {
        if (isWebUrl(fileUrl)) {
            request.get(fileUrl)
                .on("response", callback)
                .on("error", errorCallback);
        } else {
            errorCallback(Error("The url " + fileUrl + " is not a supported URI."));
        }
    }

    function isWebUrl(url: string): Boolean {
        if (!url) {
            return false;
        }
        return /^((http[s]?|ftp):\/{2})([\w-]+\.)+(\w+)(:\d{1,5})?\/?(\w*\/?)*(\.\w*)?(\??.*)$/.test(url);
    }

    function getExtension(url: string, fallback: string): string {
        let extension: string = (url) ? url.substr(url.lastIndexOf(".")) : "";
        if (extension.length === 0) {
            extension = fallback;
        }
        return extension;
    }

    function urlForKey(bucket: string, key: string) {
        return "https://s3.amazonaws.com/" + bucket + "/" + key;
    }
}