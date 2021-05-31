const Movie = require('../models/movies');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.send(movie))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  })
    .then((movie) => res.status(200).send({
      _id: movie._id,
      country: movie.country,
      director: movie.director,
      duration: movie.duration,
      year: movie.year,
      description: movie.description,
      image: movie.image,
      trailer: movie.trailer,
      nameRU: movie.nameRU,
      nameEN: movie.nameEN,
      thumbnail: movie.thumbnail,
      movieId: movie.movieId,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка. Данные некорректны'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(() => {
      const error = new Error('CastError');
      error.statusCode = 404;
      throw error;
    }).then((movie) => {
      if (!movie) {
        next(new NotFoundError('Карточка не найдена'));
      } else if (!movie.owner.equals(req.user._id)) {
        next(new ForbiddenError('Невозможно удалить чужую карточку'));
      } else {
        Movie.findByIdAndRemove(req.params._id)
          .orFail(() => {
            const error = new Error('CastError');
            error.statusCode = 404;
            throw error;
          }).then(() => {
            if (!movie) {
              next(new NotFoundError('Карточка не найдена'));
            } else {
              Movie.deleteOne(movie);
              res.status(200).send({
                message: 'Карточка удалена успешно',
              });
            }
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequestError('Данные некорректны'));
            } else {
              next(err);
            }
          });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Данные некорректны'));
      } else {
        next(err);
      }
    });
};
