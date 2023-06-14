export async function recordTab(streamId: string): Promise<MediaRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    // audio: {
    //   mandatory: {
    //     chromeMediaSource: 'tab',
    //     chromeMediaSourceId: streamId,
    //   },
    // }  as MediaTrackConstraints,
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    } as MediaTrackConstraints,
  });

  const audioCtx = new AudioContext();
  const destination = audioCtx.createMediaStreamDestination();
  const output = new MediaStream();

  const sysSource = audioCtx.createMediaStreamSource(stream);
  sysSource.connect(destination);

  let micStream;

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micSource = audioCtx.createMediaStreamSource(micStream);
    micSource.connect(destination);
  } catch (err) {
    console.log(err);
  }

  output.addTrack(destination.stream.getAudioTracks()[0]);
  output.addTrack(stream.getVideoTracks()[0]);

  const recorder = new MediaRecorder(output, {
    mimeType: 'video/webm;codecs=vp8,vp9,opus',
  });

  recorder.onstop = () => {
    stream.getTracks().forEach(track => track.stop());
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }
  };

  stream.getVideoTracks()[0].onended = () => {
    recorder.stop();
  };

  return recorder;
}
