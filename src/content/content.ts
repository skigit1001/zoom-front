import { CustomEvents } from '@/utils/enums/CustomEvents';
import { RTMessages } from '@/utils/enums/RTMessages';
import { recordTab } from '@/utils/helpers/record';
import { observeDomMutations } from './observer';
import { bufferToBase64 } from '@/utils/helpers/convert';

let recorder: MediaRecorder;

observeDomMutations();

window.addEventListener(CustomEvents.WebSocketSniffer, (event: CustomEvent) => {
  if (event.detail?.type) {
    chrome.runtime.sendMessage(event.detail);
  }
});

chrome.runtime.onMessage.addListener(async ({ type, data }) => {
  switch (type) {
  case RTMessages.SetMediaStreamId:
    try {
      recorder = await recordTab(data.streamId);
      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          const buffer = await event.data.arrayBuffer();
          chrome.runtime.sendMessage({
            type: RTMessages.SendVideoChunk,
            data: bufferToBase64(buffer)
          });
        }
      };
      await chrome.runtime.sendMessage({ type: RTMessages.StartRecording });
      recorder.start(1000);
    } catch (err) {
      console.log(err);
    }
      
    break;

  case RTMessages.StopRecording:
    recorder.stop();
    recorder.stream.getTracks() // get all tracks from the MediaStream
      .forEach(track => track.stop()); // stop each of them
    break;
  }
});
