module.exports = {
  apps: [
    {
      name: 'line',
      script: 'server.js',
      env: {
        PORT: 7003,
        NODE_ENV: 'development',
        USER_SERVER: 'http://localhost:7001',
        TIME_SERVER: 'http://localhost:7002',
      },
      env_production: {
        PORT: 7003,
        NODE_ENV: 'production',
      }
    }
  ].map(service => {
    service.env.CHANNEL_ACCESS_TOKEN = 'sUiQ0gDjqdBtyJtozIiFqDP2B+LkAbHbdmu0udVnaQ+ZZSWiznn+sGSQtMLgfU/nJt8rknjvK2IwTn/cRcUVB2BIOSvW4FtRA3qbT4eBxBTM/eH0i/GiATuWQXgfNnp1RJA/srO2TxBNrkq+OG6Y+AdB04t89/1O/w1cDnyilFU=',
    service.env.CHANNEL_SECRET = '30b5f57799df0dde78220b7e55e0ff27'
    service.watch = true;
    service.instances = 1;
    service.exec_mode = 'cluster';
    return service;
  })
};
