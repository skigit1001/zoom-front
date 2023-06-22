export const DEFAULT_PROXY_CONFIG = {
  mode: 'fixed_servers',
  rules: {
    proxyForHttps: {
      scheme: 'http',
      host: '127.0.0.1',
      port: 3128,
    },
    bypassList: ['localhost'],
  },
};

export default function setupProxy(config = DEFAULT_PROXY_CONFIG) {
  chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {
    console.log('Setup proxy successfully!');
  });
}
