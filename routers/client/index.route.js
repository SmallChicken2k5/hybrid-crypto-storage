const homeRoute = require('./home.route');
const authRoute = require('./auth.route');
const fileRoute = require('./file.route');
module.exports = (app) => {
    app.use('/', homeRoute);
    app.use('/auth', authRoute);
    app.use('/files', fileRoute);
};
