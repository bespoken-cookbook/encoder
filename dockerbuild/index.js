"use strict";
const http = require("http");
const serverEncoder_1 = require("./serverEncoder");
const PARAM_SOURCE_URL = "sourceUrl".toLocaleLowerCase();
const PARAM_TARGET_BUCKET = "targetBucket".toLocaleLowerCase();
const PARAM_TARKET_KEY = "targetKey".toLocaleLowerCase();
const PARAM_ACCESS_ID = "accessKeyID".toLocaleLowerCase();
const PARAM_ACCESS_SECREY_KEY = "accesssecretKey".toLocaleLowerCase();
let server = http.createServer(function (request, response) {
    let method = request.method;
    let url = request.url;
    let headers = request.headers;
    console.info("method = " + method + " url = " + url);
    console.info(headers);
    request.on("error", function (err) {
        console.error(err);
        response.statusCode = 400;
        response.statusMessage = "Error retrieving the request.";
        response.end();
    });
    response.on("error", function (err) {
        console.error("There was an error sending the response.");
    });
    if (request.method === "POST" && request.url === "/encode") {
        console.info("going in");
        let body = [];
        request.on("data", function (chunk) {
            body.push(chunk);
        }).on("end", function () {
            try {
                checkHeaders(headers, response);
            }
            catch (e) {
                response.end();
                return;
            }
            let musicSourceUrl = headers[PARAM_SOURCE_URL];
            let targetBucket = headers[PARAM_TARGET_BUCKET];
            let targetKey = headers[PARAM_TARKET_KEY];
            let accessKeyId = headers[PARAM_ACCESS_ID];
            let accessSecret = headers[PARAM_ACCESS_SECREY_KEY];
            serverEncoder_1.Encoder.encode(musicSourceUrl, targetBucket, targetKey, accessKeyId, accessSecret, function (err, url) {
                console.info("ending");
                response.statusCode = (err) ? 400 : 200;
                response.statusMessage = (err) ? err.message : "OK";
                response.setHeader("Content-Type", "text/plain");
                response.write(url);
                response.end();
            });
        });
    }
    else {
        console.info("Request is not supported:\n" + request.method + "");
        response.statusCode = 404;
        response.statusMessage = "The requested url \"" + url + "\" was not found.";
        console.info("ending");
        response.end();
    }
});
console.info("Server is listening on port 8080.");
server.listen(8080);
function checkHeaders(headers, response) {
    checkParameter(headers[PARAM_SOURCE_URL], response, "The header must include a \"sourceurl\" to the sound file.");
    checkParameter(headers[PARAM_TARGET_BUCKET], response, "The header must contain a URL to the S3 bucket to write to.");
    checkParameter(headers[PARAM_TARKET_KEY], response, "The header must contain an S3 key for access to write the file.");
}
function checkParameter(parameter, response, error) {
    if (parameter == null) {
        response.statusCode = 400;
        response.statusMessage = error;
        throw new Error(error);
    }
}
//# sourceMappingURL=index.js.map