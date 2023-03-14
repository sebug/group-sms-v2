const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const os = require('os');
const {Auth, google} = require('googleapis');

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

module.exports = authorizeForGoogle;