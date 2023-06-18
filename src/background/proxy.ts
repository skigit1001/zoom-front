import DEFAULT_PROXY_CONFIG from '@/configs/proxy';

export default function setupProxy(config = DEFAULT_PROXY_CONFIG) {
  chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {
    console.log('Setup proxy successfully!');
  });
}
