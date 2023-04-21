chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    const headers = details.requestHeaders.reduce((acc, header) => ({
      ...acc,
      [header.name]: header.value
    }), {});
    console.log(headers);
    return { cancel: true };
  },
  { urls: ["https://us04file.zoom.us/zoomfile/download*"] },
  ["blocking", "requestHeaders"]
);
