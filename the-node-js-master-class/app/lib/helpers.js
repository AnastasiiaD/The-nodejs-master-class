/*
 * helpers for various tasks
 *
 */

// Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');


// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON strung to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};


// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
      // Define all the possible characters that could go into a string
      var possibleChracters = 'abcdefghijklmnopqrstuvwxyz012345678';
      
      // Start the final string
      var str = '';
      for(var i = 1; i <= strLength; i++) {
          // Get a random character from the possibleCharacters string
          var randomCharacter = possibleChracters.charAt(Math.floor(Math.random() * possibleChracters.length))
          // Append this character to the final string
          str+=randomCharacter;
      }
      
      // Return the final string
      return str;
  } else {
      return false;
  }
};

// Send an SMS message via Twilio

helpers.sendTwilioSms = function (phone, msg, callback) {
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10  ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ?  msg.trim() : false;
    
    if(phone && msg) {
        // Config the request payload
        var payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phone,
            'Body': msg,
            
        };
        
        // Stringify the payload
        var stringPayload = querystring.stringify(payload);
        
        // Configure the request details
        var requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accoutSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload),
            }
        };
        
        // Instantiate the request object
        var req = https.request(requestDetails, function (res) {
            // Grab the status of the sent request
            var status = res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Statuse code returned was ' + status);
            }
        });
        
        // Bind to the error event so it doesn't get thrown
        req.on('error', function (e) {
            callback(e);
        });
        
        //  Add the payload
        req.write(stringPayload);
        
        // End the request
        req.end();
        
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// Get the string content of a template
helpers.getTemplate = function (templateName, callback) {
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    if(templateName) {
        var templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir + templateName + '.html', 'utf8', function (err, str) {
            if(!err && str && str.length > 0) {
                callback(false, str);
            } else {
                callback('No template could be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};












// Export the module
module.exports = helpers;