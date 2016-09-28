// / <reference path="./typings/node.d.ts" />
import * as http from 'http';
import { Encoder } from './serverEncoder';

const PARAM_SOURCE_URL: string = "sourceUrl".toLocaleLowerCase();
const PARAM_TARGET_BUCKET: string = "targetBucket".toLocaleLowerCase();
const PARAM_TARKET_KEY: string = "targetKey".toLocaleLowerCase();
const PARAM_ACCESS_ID: string = "accessKeyID".toLocaleLowerCase();
const PARAM_ACCESS_SECREY_KEY: string = "accesssecretKey".toLocaleLowerCase();

var server = http.createServer(function (request: http.IncomingMessage, response: http.ServerResponse) {
    var method = request.method;
    var url = request.url;
    var headers = request.headers;
    console.info('method = ' + method + ' url = ' + url);
    console.info(headers);

    request.on('error', function (err: Error) {
        console.error(err);
        response.statusCode = 400;
        response.statusMessage = 'Error retrieving the request.';
        response.end();
    });

    response.on('error', function (err: Error) {
        console.error('There was an error sending the response.');
    });

    if (request.method == 'POST' && request.url == '/encode') {
        console.info('going in');

        var body: Array<string | Buffer> = [];

        request.on('data', function(chunk) {
            body.push(chunk);
        }).on('end', function() {
            try {
                checkHeaders(headers, response)
            } catch (e) {
                response.end();
                return;
            }
            
            var musicSourceUrl: string = headers[PARAM_SOURCE_URL];
            var targetBucket: string = headers[PARAM_TARGET_BUCKET];
            var targetKey: string = headers[PARAM_TARKET_KEY];
            var accessKeyId: string = headers[PARAM_ACCESS_ID];
            var accessSecret: string = headers[PARAM_ACCESS_SECREY_KEY];
            
            Encoder.encode(musicSourceUrl, targetBucket, targetKey, accessKeyId, accessSecret, function(err) {
                console.info('ending');

                response.statusCode = (err) ? 400 : 200;
                response.statusMessage = (err) ? err.message : "OK";
                response.setHeader('Content-Type', 'application/json');
                response.end();
            });
        })
    } else {
        console.info('Request is not supported:\n' + request.method + '');
        response.statusCode = 404;
        response.statusMessage = 'The requested url "' + url + '" was not found.';
        console.info('ending');
        response.end();
    }
});

console.info('Server is listening on port 8080.');
server.listen(8080);

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