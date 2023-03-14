const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

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

module.exports = async function (context, req) {
    context.log('Login and get groups processed.');

    const login = checkLogin(req.body.username, req.body.password);
    if (!login) {
        context.res = {
            status: 400,
            body: "Pas autorisé"
        };
        return;
    }

    context.res = {
        body: {
            sheets: login.sheets
        }
    };
}