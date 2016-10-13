// / <reference path="./typings/node.d.ts" />
import * as http from "http";
import { Encoder } from "./serverEncoder";

const PARAM_SOURCE_URL: string = "sourceUrl".toLocaleLowerCase();
const PARAM_TARGET_BUCKET: string = "targetBucket".toLocaleLowerCase();
const PARAM_TARKET_KEY: string = "targetKey".toLocaleLowerCase();
const PARAM_ACCESS_REGION: string = "targetRegion".toLocaleLowerCase();
const PARAM_ACCESS_ID: string = "accessKeyID".toLocaleLowerCase();
const PARAM_ACCESS_SECREY_KEY: string = "accesssecretKey".toLocaleLowerCase();

let server = http.createServer(function (request: http.IncomingMessage, response: http.ServerResponse) {
    let method = request.method;
    let url = request.url;
    let headers = request.headers;

    request.on("error", function (err: Error) {
        console.error(err);
        response.statusCode = 400;
        response.statusMessage = "Error retrieving the request.";
        response.end();
    });

    response.on("error", function (err: Error) {
        console.error("There was an error sending the response.");
    });

    if (request.method === "GET" && request.url === "/") {
        // health check
        response.statusCode = 200;
        response.end();
        
    } else if (request.method === "POST" && request.url === "/encode") {
        let body: Array<string | Buffer> = [];

        request.on("data", function(chunk) {
            body.push(chunk);
        }).on("end", function() {
            try {
                checkHeaders(headers, response);
            } catch (e) {
                response.end();
                return;
            }

            let musicSourceUrl: string = headers[PARAM_SOURCE_URL];
            let targetBucket: string = headers[PARAM_TARGET_BUCKET];
            let targetKey: string = headers[PARAM_TARKET_KEY];
            let accessKeyId: string = headers[PARAM_ACCESS_ID];
            let accessSecret: string = headers[PARAM_ACCESS_SECREY_KEY];
            let region: string = headers[PARAM_ACCESS_REGION];

            let params: Encoder.Params = { 
                sourceUrl: musicSourceUrl, 
                targetBucket: targetBucket, 
                targetKey: targetKey, 
                accessKeyId: accessKeyId, 
                accessSecret: accessSecret,
                region: region }
            Encoder.encode(params, function(err: Error, url: string) {
                console.info("ending");

                response.statusCode = (err) ? 400 : 200;
                response.statusMessage = (err) ? err.message : "OK";
                response.setHeader("Content-Type", "text/plain");
                
                if (url) {
                    response.write(url);
                }

                response.end();
            });
        });
    } else {
        console.info("Request is not supported:\n" + request.method + "");
        response.statusCode = 404;
        response.statusMessage = "The requested url \"" + url + "\" was not found.";
        console.info("ending");
        response.end();
    }
});

server.listen(9200);

function checkHeaders(headers: any, response: http.ServerResponse) {
    checkParameter(headers[PARAM_SOURCE_URL], response, "The header must include a \"sourceurl\" to the sound file.");
    checkParameter(headers[PARAM_TARGET_BUCKET], response, "The header must contain a URL to the S3 bucket to write to.");
    checkParameter(headers[PARAM_TARKET_KEY], response, "The header must contain an S3 key for access to write the file.");
}

function checkParameter(parameter: any, response: http.ServerResponse, error: string) {
    if (parameter == null) {
        response.statusCode = 400;
        response.statusMessage = error;
        throw new Error(error);
    }
}