const Movie = require('../models/movies');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
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
  const owner = req.user._id;
  Movie.create({
    owner,
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
        next(err);
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId).select('+owner')
    .then((movie) => {
      if (!movie) {
        next(new NotFoundError('Фильм не найден'));
      } else if (movie.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Невозможно удалить чужой фильм'));
      }

      Movie.findByIdAndDelete(req.params.movieId).select('-owner').then(()=>{
        res.status(200).send({
          message: 'Фильм удален успешно',
        });
      }).catch((e)=>{
        res.status(500).send(e);
      });
    })
    .catch(next);
};


/*
    .orFail(() => {
        const error = new Error('CastError');
        error.statusCode = 404;
        throw error;
      }).then(() => {
        if (!card) {
          next(new NotFoundError('Карточка не найдена'));
        } else {
          Card.deleteOne(card);
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
*/
