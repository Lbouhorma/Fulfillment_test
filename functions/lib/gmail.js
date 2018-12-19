"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { google } = require('googleapis');
const Base64 = require('js-base64').Base64;
const gmail = google.gmail('v1');
const fs = require('fs');
const readline = require('readline');
// If modifying these scopes, deconste your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
const SCOPES = ['https://mail.google.com/'];
// Change token directory to your system preference
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';
// Load client secrets from a local file.
function executeCommand() {
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
        //  authorize(JSON.parse(content),getRecentEmail);
        authorize(JSON.parse(content), sendMessage);
    });
}
exports.default = executeCommand;
executeCommand();
/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
*
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
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
    const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
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
function makeBody(to, subject, message) {
    const email = 'To: "first last" <'
        + to +
        '>\r\nContent-type: text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: '
        + subject +
        '\r\n\r\n'
        + message;
    const encodedMail = Base64.encodeURI(email);
    return encodedMail;
}
/**
* Lists the labels in the user's account.
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function sendMessage(auth) {
    /* Example of data */
    const to = 'lbouhorma@gmail.com';
    const subject = 'Test Voice Controller 3';
    const message = 'Ceci est un test.';
    const encodedMail = makeBody(to, subject, message);
    gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
            'raw': encodedMail,
        } }, function (err, response) {
        if (err)
            throw err;
        console.log(response);
    });
}
// export= executeCommand();
//# sourceMappingURL=gmail.js.map