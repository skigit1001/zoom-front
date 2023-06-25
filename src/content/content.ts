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

document.addEventListener('DOMContentLoaded', async () => {
  if (location.href.includes('.zoom.us/wc/')) {
    document.body.style.display = 'none';

    const res = await chrome.runtime.sendMessage({ type: RTMessages.CaptureDesktop });

    if (res === 'ok') {
      document.body.style.display = 'block';
    } else {
      const res = await chrome.runtime.sendMessage({ type: RTMessages.BlockZoom });
      if (res === 'ok') {
        location.reload();
      }
    }
  }
});


chrome.runtime.onMessage.addListener(async ({ type, data }) => {
  switch (type) {
  case RTMessages.SetMediaStreamId:
    recorder = await recordTab(data.streamId, () => {
      chrome.runtime.sendMessage({ type: RTMessages.StopRecording });
    });
    recorder.ondataavailable = async (event) => {
      if (event.data && event.data.size > 0) {
        const buffer = await event.data.arrayBuffer();
        chrome.runtime.sendMessage({
          type: RTMessages.SendVideoChunk,
          data: bufferToBase64(buffer),
        });
      }
    };
    await chrome.runtime.sendMessage({ type: RTMessages.StartRecording });
    recorder.start(1000);
    break;
  }
});
