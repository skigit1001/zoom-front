import streamSaver from 'streamsaver';

chrome.tabCapture.capture({
  video: true,
  audio: true,
  videoConstraints: {
    mandatory: {
      chromeMediaSource: 'tab',
      minWidth: window.innerWidth,
      minHeight: window.innerHeight,
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight,
      maxFrameRate: 60
    },
  },
}, function (stream) {
  // Combine tab and microphone audio
  const output = new MediaStream();
  const audioCtx = new AudioContext();
  const syssource = audioCtx.createMediaStreamSource(stream);
  const destination = audioCtx.createMediaStreamDestination();

  syssource.connect(destination);
  output.addTrack(destination.stream.getAudioTracks()[0]);
  output.addTrack(stream.getVideoTracks()[0]);

  // Keep playing tab audio
  this.context = new AudioContext();
  this.stream = this.context.createMediaStreamSource(stream);
  this.stream.connect(this.context.destination);

  // Set up media recorder & inject content
  const mediaRecorder = new MediaRecorder(output, {
    mimeType: 'video/webm;codecs=vp8,vp9,opus'
  });
  mediaRecorder.start(1000);
  // Hide the downloads shelf
  chrome.downloads.setShelfEnabled(false);

  // This will write the stream to the filesystem asynchronously
  const { readable, writable } = new TransformStream({
    transform: (chunk, ctrl) => chunk.arrayBuffer().then(b => ctrl.enqueue(new Uint8Array(b)))
  })
  const writer = writable.getWriter()
  readable.pipeTo(streamSaver.createWriteStream('screenity.webm'));

  // Record tab stream
  var recordedBlobs = [];
  mediaRecorder.ondataavailable = event => {
    console.log(event);
    if (event.data && event.data.size > 0) {
      writer.write(event.data);

      recordedBlobs.push(event.data);
    }
  };

  // When the recording is stopped
  mediaRecorder.onstop = () => {
    // Stop tab and microphone streams
    stream.getTracks().forEach(function (track) {
      track.stop();
    });

    // Show download shelf again
    chrome.downloads.setShelfEnabled(true);

    setTimeout(() => {
      writer.close();
      chrome.downloads.search({ limit: 1 }, function (data) {

      });
    }, 1000)
  }

  // Stop recording if stream is ended when tab is closed
  stream.getVideoTracks()[0].onended = function () {
    mediaRecorder.stop();
  }
});
