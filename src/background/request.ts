chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    const headers = details.requestHeaders;
    let proxyFound = false;

    for (let i = 0; i < headers.length; i++) {
      if (headers[i].name === 'Proxy-Authorization') {
        headers[i].value = 'Your custom header value';
        proxyFound = true;
      }
    }

    if (!proxyFound) {
      headers.push({ name: 'Proxy-Authorization', value: 'Your Custom Header Value' });
    }

    return { requestHeaders: details.requestHeaders };
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders']
);
