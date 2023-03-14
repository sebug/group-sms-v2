const crypto = require('crypto');
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

module.exports = checkLogin;