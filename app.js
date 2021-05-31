const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const router = require('./routes/app');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(requestLogger);

app.use(limiter);

app.use('/', router);

app.use(auth);


app.use('/', moviesRouter);
app.use('/', usersRouter);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { message } = err;
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'Произошла ошибка на сервере'
      : message,
  });
  next();
});

app.listen(PORT, () => {});
