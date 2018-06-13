const _ = require('lodash');
const preReqMid = require('./middlewares/pre-request.middleware');
const postResMid = require('./middlewares/post-response.middleware');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
let setting = require('./config/setting')

let init = require('./init');
init()
    .then(() => {
        //////////////////////////////////////router
        app.set('port', setting.port || 3000);
        preReqMid(app);
        app.use('/', indexRouter);
        postResMid(app);
        //////////////////////////////////////
        const server = http.createServer(app);
        server.listen(app.get('port'));
        server.on('error', (error) => {
            const port = app.get('port');
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        server.on('listening', () => {
            const addr = server.address();
            const bind =
                typeof addr === 'string' ?
                'Pipe: ' + addr :
                'Port: ' + addr.port;
            console.log(bind);
        });
    });


module.exports = app;