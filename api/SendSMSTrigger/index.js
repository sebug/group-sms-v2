const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const os = require('os');
const {Auth, google} = require('googleapis');
const checkLogin = require('../shared/checkLogin.js');
const authorizeForGoogle = require('../shared/authorizeForGoogle.js');


const sendSMS = async (member, message, context) => {
    try {
        context.log('Message sent to ' + member.phoneNumber + ': ' + message);
        context.log('Fetch is ' + fetch);
        return {
            member: member,
            result: 'envoyé'
        };
    } catch (err) {
        context.log(err);
        context.log('Node version is ' + process.version);
        return {
            member: member,
            result: 'erreur d\'envoi'
        };
    }
};


module.exports = async function (context, req) {
    try {
        context.log('Login and get groups processed.');

        const login = checkLogin(req.body.username, req.body.password);
        if (!login) {
            context.res = {
                status: 400,
                body: "Pas autorisé"
            };
            return;
        }

        if (!login.sheets.split(',').filter(s => s === 'all' || s === req.body.group).length) {
            context.res = {
                status: 400,
                body: "Pas autorisé pour le groupe " + req.body.group
            };
            return;
        }
    
        const client = await authorizeForGoogle(context);

        const sheets = google.sheets({version: 'v4', auth: client });

        context.log(process.env.SHEET_ID);

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: req.body.group + '!A2:B',
        });

        const members = [];
        const memberLookup = {};
        for (const row of res.data.values) {
            if (row[0] && row[1]) {
                const member = {
                    firstName: row[0],
                    lastName: row[1]
                };
                members.push(member);
                memberLookup[member.firstName + " " + member.lastName] = member;
            }
        }

        const firstSheet = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: process.env.PHONE_NUMBERS_TAB_NAME + '!A2:C',
        });

        for (const row of firstSheet.data.values) {
            if (row[0] && row[1] && row[2]) {
                const phoneNumber = row[2];
                const firstName = row[0];
                const lastName = row[1];
                const member = memberLookup[firstName + " " + lastName];
                if (member) {
                    member.phoneNumber = phoneNumber;
                }
            }
        }

        const sendResults = [];
        for (const member of members) {
            if (member.phoneNumber) {
                const sendResult = await sendSMS(member, req.body.message, context);
                sendResults.push(sendResult);
            }
        }
    
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {
                sendResults: sendResults
            }
        };
    } catch (err) {
        context.log(err);
        context.res = {
            status: 500,
            body: '' + err
        };
    }
}