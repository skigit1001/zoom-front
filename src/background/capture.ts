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
  injectContent(true);
}

// Stop recording
function endRecording(stream, writer, recordedBlobs) {

  // Get video duration
  chrome.storage.sync.get(['start', 'total'], function (result) {
    chrome.storage.sync.set({
      total: Date.now() - result.start + result.total
    });
  });

  // Show default icon

  // Hide injected content
  recording = false;
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendMessage(tab.id, {
      type: "end"
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

// Start recording the entire desktop / specific application
function getDesktop() {
  var constraints = {
    audio: true,
    video: true,
    maxframeRate: fps
  };
  navigator.mediaDevices.getDisplayMedia(constraints).then(function (stream) {
    output = new MediaStream();
    if (stream.getAudioTracks().length == 0) {
      // Get microphone audio (system audio is unreliable & doesn't work on Mac)
      if (micable) {
        micsource.connect(destination);
        output.addTrack(destination.stream.getAudioTracks()[0]);
      }
    } else {
      syssource = audioCtx.createMediaStreamSource(stream);
      if (micable) {
        micsource.connect(destination);
      }
      syssource.connect(destination);
      output.addTrack(destination.stream.getAudioTracks()[0]);
    }
    output.addTrack(stream.getVideoTracks()[0]);

    // Set up media recorder & inject content
    newRecording(output);

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

    // Stop recording if stream is ended via Chrome UI or another method
    stream.getVideoTracks()[0].onended = function () {
      cancel = false;
      mediaRecorder.stop();
    }
  })
}

// Start recording the current tab
function getTab() {
  chrome.tabs.getSelected(null, function (tab) {
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
  });
}

// Inject content scripts to start recording
function startRecording() {
  chrome.storage.sync.set({
    start: Date.now()
  });
  if (recording_type == "camera-only") {
    injectContent(true);
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
            getDesktop();
          } else if (recording_type == "tab-only") {
            getTab();
          }
        }).catch(function (error) {
          micable = false;

          // Check recording type
          if (recording_type == "desktop") {
            getDesktop();
          } else if (recording_type == "tab-only") {
            getTab();
          }
        });
      });
    });
  });
}

// Inject content script
function injectContent(start) {
  chrome.storage.sync.get(['countdown'], function (result) {
    chrome.tabs.query({ active: true }, function (tabs) {
      const tab = tabs[0];
      if (maintabs.indexOf(tab.id) === -1 && recording_type !== "camera-only") {
        // Inject content if it's not a camera recording and the script hasn't been injected before in this tab
        tabid = tab.id;
        chrome.tabs.executeScript(tab.id, {
          file: './content.js'
        });
        maintabs.push(tab.id);
      } else {
        // If the current tab already has the script injected
        if (start) {
          chrome.tabs.sendMessage(tab.id, {
            type: "restart",
            countdown: result.countdown
          });
        } else {
          chrome.tabs.sendMessage(tab.id, {
            type: "restart",
            countdown: false,
            camerapos: camerapos,
            camerasize: camerasize
          });
        }
      }
    })
  })
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

// Mute/unmute microphone and system audio
function audioSwitch(source, enable) {
  // Start a new microphone stream if one doesn't exist already
  if (!micable) {
    chrome.tabs.getSelected(null, function (tab) {
      navigator.mediaDevices.getUserMedia({
        audio: true
      }).then(function (mic) {
        micable = true;
        micstream = mic;
        micsource = audioCtx.createMediaStreamSource(mic);
        micsource.connect(destination);
      }).catch(function (error) {
        chrome.tabs.sendMessage(tab.id, {
          type: "no-mic-access"
        });
      });
    });
  }
  if (source == "mic" && !enable && micable) {
    micsource.disconnect(destination);
  } else if (source == "mic" && enable && micable) {
    micsource.connect(destination);
  } else if (source == "tab" && !enable) {
    syssource.disconnect(destination);
  } else {
    syssource.connect(destination);
  }
}

// Update camera device
function updateCamera(request) {
  chrome.tabs.query({ active: true }, function (tabs) {
    const tab = tabs[0];
    // Save user preference
    chrome.storage.sync.set({
      camera: request.id
    });

    // Send user preference to content script
    chrome.tabs.sendMessage(tab.id, {
      type: request.type,
      id: request.id
    });
  });
}

// Countdown is over / recording can start
function countdownOver() {
  if (!recording) {
    mediaRecorder.start(1000);
    recording = true;
  }
}

// Inject content when tab redirects while recording
function pageUpdated(sender) {
  chrome.tabs.query({ active: true }, function (tabs) {
    const tab = tabs[0];
    if (sender.tab.id == tab.id) {
      if (recording && tab.id == tabid && recording_type == "tab-only") {
        injectContent(false)
        getDeviceId();
        tabid = 0;
      } else if (recording && recording_type == "desktop") {
        injectContent(false)
        getDeviceId();
        tabid = 0;
      }
      maintabs.splice(maintabs.indexOf(tabid), 1);
    }
  });
}

// Changed tab selection
chrome.tabs.onActivated.addListener(function (activeTabInfo) {
  if (!recording) {
    // Hide injected content if the recording is already over
    chrome.tabs.query({ active: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "end"
      });
    });
  } else if (recording && recording_type == "desktop" && maintabs.indexOf(activeTabInfo.tabId) == -1) {
    // Inject content for entire desktop recordings (content should be on any tab)
    injectContent(false);
  }
});

chrome.tabs.onRemoved.addListener(function (tabid, removed) {
  // Stop recording if tab is closed in a camera only recording
  if (tabid == tabid && recording && recording_type == "camera-only") {
    recording = false;

    // Show default icon
    tabid = 0;
  }
})

// Listen for messages from content / popup
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type == "record") {
      startRecording();
    } else if (request.type == "pause") {
      pauseRecording();
      sendResponse({ success: true });
    } else if (request.type == "resume") {
      resumeRecording();
      sendResponse({ success: true });
    } else if (request.type == "stop-save") {
      stopRecording(request.type);
    } else if (request.type == "stop-cancel") {
      stopRecording(request.type);
    } else if (request.type == "audio-request") {
      sendResponse({ devices: audiodevices });
    } else if (request.type == "update-mic") {
      updateMicrophone(request.id, request);
    } else if (request.type == "update-camera") {
      updateCamera(request);
    } else if (request.type == "audio-switch") {
      audioSwitch(request.source, request.enable);
    } else if (request.type == "camera-list") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: request.type,
          devices: request.devices,
          audio: request.audio
        });
      });
    } else if (request.type == "flip-camera") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: request.type,
          enabled: request.enabled
        });
      });
    } else if (request.type == "switch-toolbar") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: request.type,
          enabled: request.enabled
        });
      });
    } else if (request.type == "countdown") {
      countdownOver();
    } else if (request.type == "recording-type") {
      recording_type = request.recording;
    } else if (request.type == "record-request") {
      sendResponse({ recording: recording });
    } else if (request.type == "pause-camera") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: "pause-camera"
        });
      });
    } else if (request.type == "resume-camera") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: "resume-record"
        });
      });
    } else if (request.type == "no-camera-access") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: "no-camera-access"
        });
      });
    } else if (request.type == "audio-check") {
      getDeviceId();
    } else if (request.type == "end-camera-recording") {
      recording = false;
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: "end-recording"
        });
      });
    } else if (request.type == "sources-loaded") {
      pageUpdated(sender);
    } else if (request.type == "camera-size") {
      camerasize = request.size;
    } else if (request.type == "camera-pos") {
      camerapos.x = request.x;
      camerapos.y = request.y;
    } else if (request.type == "test") {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: "hello"
        });
      });
    }
  }
);
