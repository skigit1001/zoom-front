const DEFAULT_PROXY_CONFIG = {
  mode: 'fixed_servers',
  rules: {
    proxyForHttps: {
      scheme: 'http',
      host: 'localhost',
      port: 8080
    },
    bypassList: ['localhost']
  }
};

export default DEFAULT_PROXY_CONFIG;