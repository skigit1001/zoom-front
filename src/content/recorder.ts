import { RTMessages } from '@/utils/enums/RTMessages';
import { recordTab } from '@/utils/helpers/record';
import { bufferToBase64 } from '@/utils/helpers/convert';
import { CustomEvents } from '@/utils/enums/CustomEvents';
import { emitNativeCustomEvent } from '@/utils/helpers/event';

let recorder: MediaRecorder;

window.addEventListener(
  CustomEvents.MediaRecorder,
  async (event: CustomEvent) => {
    if (!event.detail?.type) {
      return;
    }

    const { type, data } = event.detail;

    switch (type) {
    case RTMessages.SetMediaStreamId:
      try {
        recorder = await recordTab(data.streamId);
        recorder.ondataavailable = async (event) => {
          if (event.data && event.data.size > 0) {
            const buffer = await event.data.arrayBuffer();
            emitNativeCustomEvent(CustomEvents.MediaRecorder, {
              type: RTMessages.SendVideoChunk,
              data: bufferToBase64(buffer),
            });
          }
        };
        emitNativeCustomEvent(CustomEvents.MediaRecorder, {
          type: RTMessages.StartRecording,
        });
      } catch (err) {
        console.log(err);
      }

      break;
    case RTMessages.StartedRecording:
      recorder.start(1000);
      break;

    case RTMessages.StopRecording:
      if (recorder) {
        recorder.stop();
        recorder.stream
          .getTracks() // get all tracks from the MediaStream
          .forEach((track) => track.stop()); // stop each of them
      } else {
        alert('Recording is not started or got unknown error!');
      }
      break;
    }

    return Promise.resolve();
  }
);
