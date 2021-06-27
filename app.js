const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');

const DB_ADDRESS = require('./utils/config');
const limiter = require('./utils/rateLimit');

const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const router = require('./routes/app');
const errorRouter = require('./routes/error');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');

const options = {
  origin: [
    'http://localhost:3000',
    'https://alligator.nomoredomains.icu'
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Accept'],
  credentials: true,
};

// Слушаем 3000 порт
const { PORT = 3000, DB_LOCAL = DB_ADDRESS } = process.env;

const app = express();

app.use(helmet());

app.use('*', cors(options));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect(DB_LOCAL, {
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
app.use('/', errorRouter);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { message } = err;
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'Произошла ошибка на сервере' : message,
  });
  next();
});

app.listen(PORT, () => { });
