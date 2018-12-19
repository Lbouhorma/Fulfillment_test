"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const executeCommand = require("./gmail");
exports.sendMessage = functions.https.onRequest((request, response) => {
    executeCommand();
});
//# sourceMappingURL=index.js.map