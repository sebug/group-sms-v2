module.exports = async function (context, req) {
    context.log('Login and get groups processed.');

    context.res = {
        body: {
            username: req.body.username,
            password: req.body.password
        }
    };
}