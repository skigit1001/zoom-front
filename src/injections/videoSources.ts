// Get a list of the available camera devices
function getCameraSources() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      const cameradevices = [];
      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach(function (device) {
          if (device.kind == 'videoinput') {
            cameradevices.push({ label: device.label, id: device.deviceId });
          }
        });
        chrome.runtime.sendMessage({ type: 'sources', devices: cameradevices });
      });
    })
    .catch(function (error) {
      chrome.runtime.sendMessage({ type: 'sources-noaccess' });
    });
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == 'camera-request') {
    getCameraSources();
  }
});
chrome.runtime.sendMessage({ type: 'sources-loaded' });
