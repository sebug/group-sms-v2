const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const os = require('os');
const {Auth, google} = require('googleapis');
const checkLogin = require('../shared/checkLogin.js');
const authorizeForGoogle = require('../shared/authorizeForGoogle.js');


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
                if (member.firstName && member.lastName) {
                    memberLookup[member.firstName.toUpperCase() + " " + member.lastName.toUpperCase()] = member;
                }
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
                const member = memberLookup[firstName.toUpperCase() + " " + lastName.toUpperCase()];
                if (member) {
                    member.phoneNumber = phoneNumber;
                }
            }
        }
    
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {
                members: members
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