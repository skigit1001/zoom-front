// Inject the iframe to retrieve camera sources
const camIframe = document.createElement('iframe');
camIframe.style.display = "none";
camIframe.src = chrome.extension.getURL('./sources.html');
camIframe.allow = "camera";
document.body.appendChild(camIframe);

const micIframe = document.createElement('iframe');
micIframe.style.display = "none";
micIframe.src = chrome.extension.getURL('./audiosources.html');
micIframe.allow = "microphone";
document.body.appendChild(micIframe);