import streamSaver from 'streamsaver';

export async function recordTab(streamId: string): Promise<MediaRecorder> {
  const stream = await (navigator as any).mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
  });

  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8,vp9,opus',
  });
  // const { readable, writable } = new TransformStream({
  //   transform: (chunk, ctrl) => chunk.arrayBuffer().then(b => ctrl.enqueue(new Uint8Array(b)))
  // })
  // const writer = writable.getWriter();
  // readable.pipeTo(streamSaver.createWriteStream('recording.webm'));

  return recorder;
}
