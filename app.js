var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var apiRouter = require('./routes/');

var app = express();

const corsWhiteList = ["sehat-scan.netlify.app"]

const corsConfig = {
    credentials: true,
    optionSuccessStatus: 200,
    origin: function (origin, callback) {
      const isOriginInWhiteList = origin && corsWhiteList.include(origin)
      callback(null, isOriginInWhiteList)
    }
}

app.use(cors(corsConfig));
app.options("*", cors(corsConfig))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', apiRouter);

module.exports = app;