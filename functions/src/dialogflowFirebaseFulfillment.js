const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
const executeCommand= require("./gmail")

//const sendMessage = functions.sendMessage();
//const executeCommand= require("./gmail")


const app = dialogflow()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


app.intent("Default Welcome Intent", conv => {
        executeCommand();
        conv.ask('Sending a mail')
});
    



//export const sendMessage = functions.https.onRequest(app)
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)