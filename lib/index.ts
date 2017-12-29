/// <reference path="../typings/index.d.ts" />
import * as http from "http";
import * as https from "https";
import { Encoder } from "./serverEncoder";
import * as process from "process";

const PARAM_ACCESS_ID: string = "accessKeyID".toLocaleLowerCase();
const PARAM_ACCESS_SECRET_KEY: string = "accessSecretKey".toLocaleLowerCase();
const PARAM_FILTER_VOLUME: string = "filterVolume".toLocaleLowerCase();
const PARAM_SOURCE_URL: string = "sourceUrl".toLocaleLowerCase();
const PARAM_TARGET_BUCKET: string = "targetBucket".toLocaleLowerCase();
const PARAM_TARGET_KEY: string = "targetKey".toLocaleLowerCase();

process.on("uncaughtException", function(error: Error) {
    console.error("UncaughtException: " + error.toString());
});

const app = function (request: http.IncomingMessage, response: http.ServerResponse) {
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
            let targetKey: string = headers[PARAM_TARGET_KEY];
            let accessKeyId: string = headers[PARAM_ACCESS_ID];
            let accessSecret: string = headers[PARAM_ACCESS_SECRET_KEY];

            // Default volume adjustment to 1.0 - which means 100% of current volume
            //  Means to just leave it alone
            let filterVolume = 1.0;
            if (PARAM_FILTER_VOLUME in headers) {
                filterVolume = parseFloat(headers[PARAM_FILTER_VOLUME]);
            }

            let params: Encoder.Params = {
                sourceUrl: musicSourceUrl,
                targetBucket: targetBucket,
                targetKey: targetKey,
                filterVolume: filterVolume,
                accessKeyId: accessKeyId,
                accessSecret: accessSecret };
            Encoder.encode(params, function(err: Error, url: string) {

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
}

// Get the HTTP and HTTPS port - set to 9200 by default
const httpsPort = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT, 10) : undefined;
const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 9200;

// Handle server creation for SSL
if (httpsPort) {
    const credentials = {
        key: process.env.SSL_KEY.replace(/\\n/g, "\n"),
        cert: process.env.SSL_CERT.replace(/\\n/g, "\n"),
    };
    const server = https.createServer(credentials as any, app as any);
    server.setTimeout(0);
    server.listen(httpsPort, () => {
        console.log("Encoder Server running on port :" + httpsPort);
    });
}

// Handles server creation for plain HTTP
if (httpPort) {
    const server = http.createServer(app as any);
    server.timeout = 0;
    server.listen(httpPort, () => {
        console.log("Encoder Server running on port :" + httpPort);
    });
}



function checkHeaders(headers: any, response: http.ServerResponse) {
    checkParameter(headers[PARAM_SOURCE_URL], response, "The header must include a \"sourceurl\" to the sound file.");
    checkParameter(headers[PARAM_TARGET_BUCKET], response, "The header must contain a URL to the S3 bucket to write to.");
    checkParameter(headers[PARAM_TARGET_KEY], response, "The header must contain an S3 key for access to write the file.");
}

function checkParameter(parameter: any, response: http.ServerResponse, error: string) {
    if (parameter == null) {
        response.statusCode = 400;
        response.statusMessage = error;
        throw new Error(error);
    }
}