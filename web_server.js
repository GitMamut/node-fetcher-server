var dateFormat = require("dateformat");
var request = require("request");
var http = require('http');
var sensorUrl = "http://espeasy/json?tasknr=2&view=sensorupdate";
var reqCounter = 0;

var server = http.createServer((function (request, myResponse) {
    let reqId = reqCounter++;
    logToConsole("RQ <- " + request.url, reqId);
    if (request.url == "/") {
        getRemoteResponse(myResponse, reqId);
    } else {
        myResponse.statusCode = 404;
        myResponse.end();
        logToConsole("RS -> " + myResponse.statusCode, reqId);
    }
}));
server.listen(7000);

logToConsole("Server running", reqCounter++);

function logToConsole(message, id) {
    let formattedDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    console.log("[" + formattedDate + "][" + id + "] " + message);
}

function getRemoteResponse(myResponse, reqId) {
    logToConsole("RRQ -> " + sensorUrl, reqId);
    request(sensorUrl, function (error, response, body) {
        if (error) {
            logToConsole("RRS <- " + error, reqId);
            myResponse.statusCode = 500;
            myResponse.end();
            logToConsole("RS <- " + myResponse.statusCode, reqId);
        } else {
            logToConsole("RRS <- " + body.replace(/(\r\n|\n|\r)/gm, ''), reqId);

            let formattedResults = JSON.parse(body).TaskValues.map(v => ({
                "name": v.Name,
                "value": v.Value
            }));
            let sensorResponse = {
                "name": "espeasy",
                "date": new Date().getTime(),
                "values": formattedResults
            };
            myResponse.writeHead(200, {
                "Content-type": "text/json"
            });
            myResponse.end(JSON.stringify(sensorResponse));
            logToConsole("RS <- " + myResponse.statusCode, reqId);
        }
    });
}