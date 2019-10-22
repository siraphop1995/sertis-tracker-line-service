const mongoose = require('mongoose');
const process = require('process');
const routes = require('./src');
const errorHandler = require('./src/utils/errorHandler');

app = require('./app');
port = process.env.PORT || 3000;

//Mongoose setting
mongoose.Promise = require('bluebird');
const mongooseConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
};
mongoose.connect(process.env.MONGO_URL, mongooseConfig, error => {
  if (error) throw error;
  console.log('Successfully connected to mongodb at:', process.env.MONGO_URL);
});

//Router
app.use('/', routes);

//custom error handler middleware
app.use(errorHandler);

//Listen port
app.listen(port, () => {
  console.log('Start listen on port: ' + port);
});
