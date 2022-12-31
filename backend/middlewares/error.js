const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...({ stack: err.stack }),
  };

  logger.error(err);
  var err_logger = fs.createWriteStream(path.join(`${__dirname}/../../tmp/log.txt`), {
    flags: 'a'
  });
  var writeError = (line) => err_logger.write(`${line}\n`);
  var now = new Date();
  const iso = now.toISOString();
  var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  writeError(iso);
  writeError(myDate);
  writeError(err.stack+'\n');

  if (err.statusCode === 404 && response.message === 'Not found 404') {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/codePen404.html`));
  } else if(err.statusCode === 401) {
    res.status(statusCode).send(response);
  } else{
    res.status(statusCode).send(response);
  }
};

module.exports = {
  errorConverter,
  errorHandler,
};
