const errorRouter = require('express').Router();
const NotFoundError = require('../errors/NotFoundError');

errorRouter.use('*', () => {
  throw new NotFoundError('Ресурс не найден');
});

module.exports = errorRouter;
