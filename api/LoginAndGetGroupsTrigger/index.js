const crypto = require('crypto');

module.exports = async function (context, req) {
    context.log('Login and get groups processed.');

    const passwordHashed = crypto.createHash('sha256').update(req.body.password, 'utf8').digest().toString('base64');

    context.res = {
        body: {
            username: req.body.username,
            passwordHash: passwordHashed
        }
    };
}