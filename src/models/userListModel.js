const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  lineId: {
    type: String,
    unique: true,
    Required: true
  },
  employeeId: {
    type: String,
    unique: true,
    Required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  nickName: {
    type: String
  }
});

module.exports = mongoose.model('Users', UserSchema);
