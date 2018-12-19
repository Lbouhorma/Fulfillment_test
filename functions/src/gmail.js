var fs = require('fs');
var readline = require('readline');
var google = require('googleapis').google;
var base64url = require('base64url');
var Base64 = require('js-base64').Base64;
// If modifying these scopes, deconste your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
var SCOPES = ['https://mail.google.com/'];
// Change token directory to your system preference
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';
console.log(TOKEN_DIR, TOKEN_PATH);
var gmail = google.gmail('v1');

const secret={"installed":{"client_id":"586480029881-4a5khp4t8iobeo9gnpejp6lfviutjqv2.apps.googleusercontent.com","project_id":"voice-controller-57710","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"z8UsiOmo7GKZux6sSangzEmS","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}

function executeCommand() {
    console.log("executing");
    authorize(secret, sendMessage);
}

exports["default"] = executeCommand;
executeCommand();
/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
*
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        }
        else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}
/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
*
* @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback to call with the authorized
*     client.
*/
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}
/**
* Store token to disk be used in later program executions.
*
* @param {Object} token The token to store to disk.
*/
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    }
    catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}
/**
* Get the recent email from your Gmail account
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function getRecentEmail(auth) {
    // Only get the recent email - 'maxResults' parameter
    gmail.users.messages.list({ auth: auth, userId: 'me' }, function (err, response) {
        /*console.log("reponse : " )
        console.log(response.data.resultSizeEstimate)*/
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        // Get the message id which we will need to retreive tha actual message next.
        //const message_id = response['data']['messages'][0]['id'];
        console.log("message_id of all messages: ");
        for (var k = 0; k < response.data.resultSizeEstimate; k++) {
            console.log(response['data']['messages'][k]['id']);
            var message_id = response['data']['messages'][k]['id'];
            var num_msg = 0;
            gmail.users.messages.get({ auth: auth, userId: 'me', 'id': message_id }, function (err, response) {
                console.log("             ");
                console.log("             ");
                console.log("--------------------------------------");
                var contact_json = response['data'].payload.headers.find(function (el) { return el.name === 'From'; });
                console.log("Contact: " + contact_json.value);
                console.log("             ");
                var date_json = response['data'].payload.headers.find(function (el) { return el.name === 'Date'; });
                console.log("Date: " + date_json.value);
                console.log("             ");
                var subject_json = response['data'].payload.headers.find(function (el) { return el.name === 'Subject'; });
                console.log("Subject: " + subject_json.value);
                console.log("             ");
                console.log("Message number " + num_msg + "        ");
                num_msg++;
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                console.log(base64url.decode(response.data.payload.parts[0].body.data));
            });
        }
        // Retreive the actual message using the message id
    });
}
var store_id = function (f, param) {
    var result = [];
    //new Array(param.length);
    for (var el in param) {
        console.log(param[el]);
        result.push(f(param[el]));
    }
    return result;
};
/**
* Retrieve Messages in user's mailbox matching query.
*
* @param  {String} userId User's email address. The special value 'me'
* can be used to indicate the authenticated user.
* @param  {String} query String used to filter the Messages listed.
* @param  {Function} callback Function to call when the request is complete.
/**
* Lists the labels in the user's account.
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function listLabels(auth) {
    gmail.users.labels.list({ auth: auth, userId: 'me' }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var labels = response.data.labels;
        if (labels.length == 0) {
            console.log('No labels found.');
        }
        else {
            console.log('Labels:');
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                console.log('%s', label.name);
            }
        }
    });
}
function makeBody(to, subject, message) {
    var email = 'To: "first last" <'
        + to +
        '>\r\nContent-type: text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: '
        + subject +
        '\r\n\r\n'
        + message;
    var encodedMail = Base64.encodeURI(email);
    return encodedMail;
}
function sendMessage(auth) {
    console.log("sending message");
    /* Example of data */
    var to = 'lbouhorma@gmail.com';
    var subject = 'Test Voice Controller 3';
    var message = 'Ceci est un test.';
    var encodedMail = makeBody(to, subject, message);
    gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
            'raw': encodedMail
        } }, function (err, response) {
        if (err)
            throw err;
        console.log(response);
    });
}
module.exports = function sendMessage(auth) {
    /* Example of data */
    var to = 'lbouhorma@gmail.com';
    var subject = 'Test Voice Controller 3';
    var message = 'Ceci est un test.';
    var encodedMail = makeBody(to, subject, message);
    gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
            'raw': encodedMail
        } }, function (err, response) {
        if (err)
            throw err;
        console.log(response);
    });
};
executeCommand();
// export= executeCommand(); 
