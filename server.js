const process = require('process');
const routes = require('./src');
const errorHandler = require('./src/utils/errorHandler');

app = require('./app');
port = process.env.PORT || 3000;

//Router
app.use('/', routes);

//custom error handler middleware
app.use(errorHandler);

//Listen port
app.listen(port, () => {
  console.log('Start listen on port: ' + port);
});
