const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
    },
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
});

// добавим метод findUserByCredentials схеме пользователя
// у него будет два параметра — почта и пароль
function findUserByCredentials(email, password) {
  // попытаемся найти пользовател по почте
  return this.findOne({ email }) // this — это модель User
    .select('+password')
    .then((user) => {
      // не нашёлся — отклоняем промис
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      // нашёлся — сравниваем хеши
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error('Неправильные почта или пароль'));
        }

        return user; // теперь user доступен
      });
    });
}
usersSchema.statics.findUserByCredentials = findUserByCredentials;

module.exports = mongoose.model('users', usersSchema);
