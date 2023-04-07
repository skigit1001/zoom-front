import { sleep } from "@/utils/helpers/process";

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    console.log(details);
    sleep(50000);
    return { cancel: true };
  },
  { urls: ["https://us04file.zoom.us/zoomfile/download*"] },
  ["blocking", "requestHeaders"]
);