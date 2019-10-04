const mongoose = require('mongoose');
const process = require('process');
const routes = require('./src')

app = require('./app');
port = process.env.PORT || 3000;

//Mongoose setting
mongoose.Promise = require('bluebird');
const mongooseConfig = {
  useNewUrlParser: true,
  useCreateIndex: true
};
mongoose.connect(process.env.MONGO_URL, mongooseConfig, error => {
  if (error) throw error;
  console.log('Successfully connected to mongodb');
});

//Router
app.use('/', routes)

//Listen port
app.listen(port, () => {
  console.log('Start listen on port: ' + port);
});
