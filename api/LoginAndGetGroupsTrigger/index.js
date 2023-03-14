const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const os = require('os');
const {Auth, google} = require('googleapis');

const checkLogin = (username, password) => {
    const passwordHashed = crypto.createHash('sha256').update(password, 'utf8').digest().toString('base64');
    const logins = JSON.parse(process.env.LOGINS);
    for (let login of logins) {
        if (login.username === username && login.passwordHash === passwordHashed) {
            return login;
        }
    }
    return null;
};

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorizeForGoogle(context) {
    await fs.writeFile(path.join(os.tmpdir(), "keyfile.json"), process.env.SERVICE_ACCOUNT_KEY);

    const auth = new Auth.GoogleAuth({
        keyFile: path.join(os.tmpdir(), "keyfile.json"),
        scopes: SCOPES
    });

    const client = await auth.getClient();

    context.log('Client is ' + client);
    context.log(client);

    return client;
  }

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
                sheets: allowedSheets
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