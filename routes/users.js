const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUser, updateUser } = require('../controllers/users');

usersRouter.get('/users/me', getUser); // возвращает информацию о пользователе (email и имя)

usersRouter.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      name: Joi.string().required().min(2).max(30),
    }),
  }), updateUser); // обновляет информацию о пользователе (email и имя)

module.exports = usersRouter;