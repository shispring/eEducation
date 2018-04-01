var winston = require("winston");
var fs = require("fs");
var path = require("path");
var logDir = path.join(__dirname, "../log"); // directory path you want to set
if (!fs.existsSync(logDir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logDir);
}

let loggers = {};

loggers["es"] = new winston.Logger({
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, "./es.log"), // this path needs to be absolute
            colorize: false,
            timestamp: true,
            json: false
        })
    ]
});


loggers["monitor"] = new winston.Logger({
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, "./monitor.log"), // this path needs to be absolute
            colorize: false,
            timestamp: true,
            json: false
        })
    ]
});

if (process.env.NODE_ENV !== "production") {
    loggers["es"].add(winston.transports.Console);
    loggers["monitor"].add(winston.transports.Console);
}

module.exports = {
    get: function (name) {
        return loggers[name];
    }
};