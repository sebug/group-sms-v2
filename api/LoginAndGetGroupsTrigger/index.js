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
    
        const client = await authorizeForGoogle(context);

        const sheets = google.sheets({version: 'v4', auth: client });

        context.log(process.env.SHEET_ID);

        const res = await sheets.spreadsheets.get({
            spreadsheetId: process.env.SHEET_ID
        });

        const loginSheets = login.sheets.split(',');

        const allowedSheets = [];
        for (const sheetInfo of res.data.sheets) {
            if (loginSheets.filter(s => s === 'all' || s === sheetInfo.properties.title).length) {
                allowedSheets.push({
                    sheetId: sheetInfo.properties.sheetId,
                    title: sheetInfo.properties.title
                });
            }
        }
    
        context.res = {
            body: {
                sheets: allowedSheets,
                withCommonCode: true
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