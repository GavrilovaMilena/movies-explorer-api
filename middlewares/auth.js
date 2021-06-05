// middlewares/auth.js
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;
const AuthError = require('../errors/AuthError');

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AuthError('Необходима авторизация'));
  }
  // извлечём токен
  const token = authorization.replace('Bearer ', '');
  // верифицируем токен
  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET_KEY : 'my-secret');
  } catch (err) {
    // отправим ошибку, если не получилось
    next(new AuthError('Необходима авторизация'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
