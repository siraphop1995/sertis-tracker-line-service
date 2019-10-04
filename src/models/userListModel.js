const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    Required: true
  },
  password: {
    type: String,
    Required: true
  },
  name: {
    type: String
  }
});

module.exports = mongoose.model('Users', UserSchema);
