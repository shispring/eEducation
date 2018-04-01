const os = require('os');
const fs = require('fs');
const logger = require('./logger').get('wawaji');
const crypto = require('crypto');


var getIp = function () {
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    return addresses.length > 0 ? addresses[0] : null;
}


var getDomain = function () {
    var domain = "";
    try {
        domain = fs.readFileSync('/etc/wwj_dns', 'utf8');
    } catch (e) {
        logger.warn("Fail to read domain");
    }
    return domain;
}

/** Sync */
function randomString(length, chars) {
    if (!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);

    var cursor = 0;
    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
}

/** Sync */
function randomAsciiString(length) {
    return randomString(length,
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}

function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}

const randUid = () => {
    let rand_uid = Math.floor(Math.random() * 100000);
    return rand_uid;
}

module.exports = {
    getIp: getIp,
    getDomain: getDomain,
    rand: randomAsciiString,
    randUid: randUid,
    formatParams: formatParams
}