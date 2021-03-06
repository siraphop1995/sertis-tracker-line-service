module.exports = {
  apps: [
    {
      name: 'line',
      script: 'server.js',
      env: {
        PORT: 7003,
        NODE_ENV: 'development',
        MONGO_URL: 'mongodb://localhost:27017/line',
        USER_SERVER: 'http://localhost:7001',
        DATE_SERVER: 'http://localhost:7002',
        AUTH_TOKEN:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NzQzMjUxMjh9.c-bdCvp112jf27i1T0Fy7rLOzOqYW2cLS-phkuhSvEw'
      },
      env_production: {
        PORT: 7003,
        NODE_ENV: 'production',
        MONGO_URL:
          'mongodb+srv://admin:admin@cluster0-mnunz.gcp.mongodb.net/line?retryWrites=true&w=majority'
      }
    }
  ].map(service => {
    (service.env.CHANNEL_ACCESS_TOKEN =
      'sUiQ0gDjqdBtyJtozIiFqDP2B+LkAbHbdmu0udVnaQ+ZZSWiznn+sGSQtMLgfU/nJt8rknjvK2IwTn/cRcUVB2BIOSvW4FtRA3qbT4eBxBTM/eH0i/GiATuWQXgfNnp1RJA/srO2TxBNrkq+OG6Y+AdB04t89/1O/w1cDnyilFU='),
      (service.env.CHANNEL_SECRET = '30b5f57799df0dde78220sb7e55e0ff27');
    service.watch = true;
    service.instances = 1;
    service.exec_mode = 'cluster';
    return service;
  })
};
