// Get a list of the available camera devices
function getAudioSources() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      const audiodevices = [];
      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach(function (device) {
          if (device.kind === 'audioinput') {
            audiodevices.push({ label: device.label, id: device.deviceId });
          }
        });
        chrome.runtime.sendMessage({
          type: 'sources-audio',
          devices: audiodevices,
        });
      });
    })
    .catch(function (error) {
      chrome.runtime.sendMessage({ type: 'sources-audio-noaccess' });
    });
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == 'camera-request') {
    getAudioSources();
  }
});
chrome.runtime.sendMessage({ type: 'sources-loaded' });
