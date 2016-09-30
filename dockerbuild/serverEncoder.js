"use strict";
const http = require("http");
const https = require("https");
const fs = require("fs");
const tmp = require("tmp");
const path = require("path");
const cprocess = require("child_process");
const aws = require("aws-sdk");
var Encoder;
(function (Encoder) {
    function encode(musicSourceUrl, targetBucket, targetKey, accessKeyId, accessSecret, callback) {
        downloadAndEncode(musicSourceUrl, function (err, mp3file) {
            if (err != null) {
                callback(err, null);
            }
            else {
                aws.config.update({
                    accessKeyId: accessKeyId,
                    secretAccessKey: accessSecret
                });
                sendOffToBucket(mp3file, targetBucket, targetKey, function (err, url) {
                    fs.unlink(mp3file);
                    callback(err, url);
                });
            }
        });
    }
    Encoder.encode = encode;
    ;
    function sendOffToBucket(fileUri, bucket, itemKey, callback) {
        fs.readFile(fileUri, { encoding: null }, function (err, data) {
            let s3 = new aws.S3();
            let params = { Bucket: bucket, Key: itemKey, Body: data, ACL: "public-read" };
            s3.putObject(params, function (err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                let url = urlForKey(bucket, itemKey);
                callback(err, url);
            });
        });
    }
    Encoder.sendOffToBucket = sendOffToBucket;
    function downloadAndEncode(sourceUrl, callback) {
        saveTempFile(sourceUrl, function (error, fileUri) {
            if (error) {
                callback(error, null);
            }
            else {
                convertFile(fileUri, function (error, outputPath) {
                    fs.unlink(fileUri);
                    callback(error, outputPath);
                });
            }
        });
    }
    Encoder.downloadAndEncode = downloadAndEncode;
    function convertFile(inputFile, callback) {
        let normalizedPath = path.normalize(inputFile);
        let options = {
            postfix: ".mp3"
        };
        tmp.tmpName(options, function (error, outputPath) {
            if (error) {
                callback(error, null);
                return;
            }
            cprocess.execFile("ffmpeg", ["-i", normalizedPath, "-codec:a", "libmp3lame", "-b:a", "48k", "-ar", "16000", "-af", "volume=3", outputPath], function (error, stdout, stderr) {
                if (error) {
                    fs.unlink(outputPath);
                    outputPath = null;
                }
                callback(error, outputPath);
            });
        });
    }
    Encoder.convertFile = convertFile;
    function saveTempFile(fileUrl, callback) {
        let postfix = getExtension(fileUrl, ".tmp");
        let options = {
            postfix: getExtension(fileUrl, ".tmp"),
            keep: true
        };
        tmp.file(options, function (err, inputPath, fileDescriptor) {
            let file = fs.createWriteStream(inputPath);
            networkGet(fileUrl, function (response) {
                if (response.statusCode === 200) {
                    try {
                        response.pipe(file);
                        file.on("finish", function () {
                            file.close();
                            callback(null, inputPath);
                        });
                    }
                    catch (e) {
                        callback(e, null);
                    }
                }
                else {
                    callback(Error("Could not retrieve file from " + fileUrl), null);
                }
            });
        });
    }
    function networkGet(fileUrl, callback) {
        let isSecure = fileUrl.startsWith("https");
        if (isSecure) {
            https.get(fileUrl, callback);
        }
        else {
            http.get(fileUrl, callback);
        }
    }
    function getExtension(url, fallback) {
        let extension = (url) ? url.substr(url.lastIndexOf(".")) : "";
        if (extension.length === 0) {
            extension = fallback;
        }
        return extension;
    }
    function stripQueryAndFragments(url) {
        return (url) ? url.substr(0, url.indexOf("?")) : url;
    }
    function urlForKey(bucket, key) {
        return "https://s3.amazonaws.com/" + bucket + "/" + key;
    }
})(Encoder = exports.Encoder || (exports.Encoder = {}));
//# sourceMappingURL=serverEncoder.js.map