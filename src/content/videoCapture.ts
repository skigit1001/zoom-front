import { RTMessages } from '@/utils/enums/RTMessages';
import streamSaver from 'streamsaver';

const audioCtx = new AudioContext();
const destination = audioCtx.createMediaStreamDestination();
let output = new MediaStream();
let micsource;
let syssource;
let mediaRecorder: MediaRecorder = null;
let mediaConstraints;
let micstream;
let audiodevices = [];
let cancel = false;
let recording = false;
let tabid = 0;
let maintabs = [];
let recording_type = "tab-only";
let newwindow = null;
let micable = true;
let width = 1920;
let height = 1080;
let quality = "max";
let fps = 60;
let camerasize = "small-size";
let camerapos = { x: "10px", y: "10px" };

// Get list of available audio devices
getDeviceId();

chrome.runtime.onInstalled.addListener(function () {
  // Set defaults when the extension is installed
  chrome.storage.sync.set({
    toolbar: true,
    countdown: true,
    countdown_time: 3,
    flip: true,
    pushtotalk: false,
    camera: 0,
    mic: 0,
    type: "tab-only",
    quality: "max",
    fps: 60,
    start: 0,
    total: 0
  });

  // Inject content scripts in existing tabs
  chrome.tabs.query({ currentWindow: true }, function gotTabs(tabs) {
    tabs.forEach(tab => {
      if (!tab.url.includes("chrome://") && !tab.url.includes("chrome.com")) {
        chrome.tabs.executeScript(tab.id, {
          file: './detectMedia.js'
        });
      }
    })
  });
});

// Set up recording
function newRecording(stream) {
  // Show recording icon

  // Start Media Recorder
  if (quality == "max") {
    mediaConstraints = {
      mimeType: 'video/webm;codecs=vp8,vp9,opus'
    }
  } else {
    mediaConstraints = {
      mimeType: 'video/webm;codecs=vp8,vp9,opus',
      bitsPerSecond: 1000
    }
  }
  mediaRecorder = new MediaRecorder(stream, mediaConstraints);
}

// Stop recording
function endRecording(stream, writer, recordedBlobs) {

  // Get video duration
  chrome.storage.sync.get(['start', 'total'], function (result) {
    chrome.storage.sync.set({
      total: Date.now() - result.start + result.total
    });
  });

  // Stop tab and microphone streams
  stream.getTracks().forEach(function (track) {
    track.stop();
  });
  if (micable) {
    micstream.getTracks().forEach(function (track) {
      track.stop();
    });
  }

  // Show download shelf again
  chrome.downloads.setShelfEnabled(true);

  setTimeout(() => {
    writer.close();
    chrome.downloads.search({ limit: 1 }, function (data) {
      // Save recording if requested
      if (cancel) {
        chrome.downloads.removeFile(data[0].id);
      }
    });
  }, 1000)
}

chrome.runtime.onMessage.addListener(({ type, data }) => {
  if (type === RTMessages.SetMediaStreamId) {
    (navigator as any).mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: data.streamId
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: data.streamId
        }
      }
    }).then(stream => {
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        console.log(e.data);
        chunks.push(e.data);
      };
      recorder.onstop = (e) => saveToFile(new Blob(chunks), "test.wav");
      recorder.start();
    })
  }
});

function saveToFile(blob, name) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

// Start recording the current tab
function getTab() {
  chrome.tabCapture.capture({
    video: true,
    audio: true,
    videoConstraints: {
      mandatory: {
        chromeMediaSource: 'tab',
        minWidth: width,
        minHeight: height,
        maxWidth: width,
        maxHeight: height,
        maxFrameRate: fps
      },
    },
  }, function (stream) {
    // Combine tab and microphone audio
    output = new MediaStream();
    syssource = audioCtx.createMediaStreamSource(stream);
    if (micable) {
      micsource.connect(destination);
    }
    syssource.connect(destination);
    output.addTrack(destination.stream.getAudioTracks()[0]);
    output.addTrack(stream.getVideoTracks()[0]);

    // Keep playing tab audio
    this.context = new AudioContext();
    this.stream = this.context.createMediaStreamSource(stream);
    this.stream.connect(this.context.destination);

    // Set up media recorder & inject content
    newRecording(output)

    // Hide the downloads shelf
    chrome.downloads.setShelfEnabled(false);

    // This will write the stream to the filesystem asynchronously
    const { readable, writable } = new TransformStream({
      transform: (chunk, ctrl) => chunk.arrayBuffer().then(b => ctrl.enqueue(new Uint8Array(b)))
    })
    const writer = writable.getWriter()
    readable.pipeTo(streamSaver.createWriteStream('recording.webm'));

    // Record tab stream
    var recordedBlobs = [];
    mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        writer.write(event.data);
        recordedBlobs.push(event.data);
      }
    };

    // When the recording is stopped
    mediaRecorder.onstop = () => {
      endRecording(stream, writer, recordedBlobs);
    }

    // Stop recording if stream is ended when tab is closed
    stream.getVideoTracks()[0].onended = function () {
      mediaRecorder.stop();
    }

    mediaRecorder.start(1000);
  });
}

// Inject content scripts to start recording
function startRecording() {
  chrome.storage.sync.set({
    start: Date.now()
  });
  if (recording_type == "camera-only") {
    recording = true;
  }
  getDeviceId();
  record();
}

// Get microphone audio and start recording video
function record() {
  // Get window dimensions to record
  chrome.windows.getCurrent(function (window) {
    width = window.width;
    height = window.height;
  })

  var constraints;
  chrome.storage.sync.get(['fps'], function (result) {
    fps = result.fps;
    chrome.storage.sync.get(['quality'], function (result) {
      quality = result.quality;
      chrome.storage.sync.get(['mic'], function (result) {
        // Set microphone constraints
        constraints = {
          audio: {
            deviceId: result.mic
          }
        }

        // Start microphone stream
        navigator.mediaDevices.getUserMedia(constraints).then(function (mic) {
          micable = true;
          micstream = mic;
          micsource = audioCtx.createMediaStreamSource(mic);

          // Check recording type
          if (recording_type == "desktop") {
          } else if (recording_type == "tab-only") {
            getTab();
          }
        }).catch(function (error) {
          micable = false;

          // Check recording type
          if (recording_type == "desktop") {

          } else if (recording_type == "tab-only") {
            getTab();
          }
        });
      });
    });
  });
}

// Switch microphone input
function updateMicrophone(id, request) {
  // Save user preference for microphone device
  chrome.storage.sync.set({
    mic: request.id
  });
  // Check recording type
  if (recording) {
    // Stop current microphone stream
    micstream.getTracks().forEach(function (track) {
      track.stop();
    });

    // Start a new microphone stream using the provided device ID
    chrome.tabs.query({ active: true }, function (tabs) {
      navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: id
        }
      }).then(function (mic) {
        micstream = mic;
        micsource = audioCtx.createMediaStreamSource(mic);
        micsource.connect(destination);
      }).catch(function (error) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "no-mic-access"
        });
      });
    });
  }
}

// Recording controls
function pauseRecording() {
  mediaRecorder.pause();

  // Get video duration so far
  chrome.storage.sync.get(['start'], function (result) {
    chrome.storage.sync.set({
      total: Date.now() - result.start
    });
  });
}

function resumeRecording() {
  mediaRecorder.resume();

  // New start time
  chrome.storage.sync.set({
    start: Date.now()
  });
}

function stopRecording(save) {
  tabid = 0;

  // Show default icon

  chrome.tabs.query({ active: true }, function (tabs) {
    const tab = tabs[0];
    // Check if recording has to be saved or discarded
    if (save == "stop" || save == "stop-save") {
      cancel = false;
    } else {
      cancel = true;
    }

    // Check if it's a desktop or tab recording (recording done in background script)
    if (recording_type != "camera-only") {
      mediaRecorder.stop();
    } else {
      recording = false;
      if (cancel) {
        chrome.tabs.sendMessage(tab.id, {
          type: "stop-cancel"
        });
      } else {
        chrome.tabs.sendMessage(tab.id, {
          type: "stop-save"
        });
      }
    }

    // Remove injected content
    chrome.tabs.sendMessage(tab.id, {
      type: "end"
    });
  });
}

// Get a list of the available audio devices
function getDeviceId() {
  audiodevices = [];
  navigator.mediaDevices.enumerateDevices().then(function (devices) {
    devices.forEach(function (device) {
      if (device.kind == "audioinput") {
        audiodevices.push({
          label: device.label,
          id: device.deviceId
        });
      }
    });
    chrome.runtime.sendMessage({ type: "audio-done", devices: audiodevices });
  });
}
