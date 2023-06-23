import { StorageItems } from '@/utils/enums/StorageItems';
import { getStorageItems } from '@/utils/helpers/storage';

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


export const handleAuthRequired = async (_, callbackFn) => {
  const { proxyUsername, proxyPassword } = await getStorageItems([StorageItems.ProxyUsername, StorageItems.ProxyPassword]);

  callbackFn({
    authCredentials: {
      username: proxyUsername || 'invalid',
      password: proxyPassword || 'invalid'
    }
  });
};


export default function setupProxy(config = DEFAULT_PROXY_CONFIG) {
  chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {
    console.log('Setup proxy successfully!');

    // set basic HTTP credentials of username and password instead of inputting by chrome <sign in> prompt
    chrome.webRequest.onAuthRequired.removeListener(handleAuthRequired);
    chrome.webRequest.onAuthRequired.addListener(
      handleAuthRequired,
      { urls: ['<all_urls>'] }, ['asyncBlocking']
    );
  });
}
