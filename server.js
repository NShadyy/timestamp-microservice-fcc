// server.js
// where your node app starts

const express = require('express');
const rTracer = require('cls-rtracer');
const { ApiLoggerMiddleware, Logger } = require('./logger');
require('dotenv').config();

// init project
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(rTracer.expressMiddleware(), ApiLoggerMiddleware);

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// endpoint for handling timestamps...
app.get('/api', function (req, res) {
  const date = new Date();
  res.json({ unix: date.getTime(), utc: date.toUTCString() });
});

app.get('/api/:date', function (req, res) {
  const dateParam = req.params.date;
  let date = undefined;

  Logger.info(`Server.handleTimestamp.started`, {
    dateParam,
  });

  if (/^\d{1,}$/gm.test(dateParam)) {
    date = new Date(parseInt(dateParam));
  } else {
    date = new Date(dateParam);
  }

  let isValidDate = true;
  if (Object.prototype.toString.call(date) === '[object Date]') {
    if (isNaN(date.getTime())) {
      // d.valueOf() could also work
      isValidDate = false;
    }
  } else {
    isValidDate = false;
  }

  if (!isValidDate) {
    Logger.error(`Server.handleTimestamp.invalidDate`);
    res.json({ error: 'Invalid Date' });
  }

  Logger.info(`Server.handleTimestamp.success`, { date });
  res.json({ unix: date.getTime(), utc: date.toUTCString() });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  Logger.info('Server', `Your app is listening on port ${listener.address().port}`);
});
