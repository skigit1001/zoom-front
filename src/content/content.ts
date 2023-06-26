import { CustomEvents } from '@/utils/enums/CustomEvents';
import { RTMessages } from '@/utils/enums/RTMessages';
import { recordTab } from '@/utils/helpers/record';
import { observeDomMutations } from './observer';
import { bufferToBase64 } from '@/utils/helpers/convert';
import { StatusCode } from '@/utils/enums/StatusCodes';
import { REGX_ZOOM_MEETING } from '@/utils/constants/regx';

observeDomMutations();

// forward websocket events from socketSniffer to service worker
window.addEventListener(CustomEvents.WsData, (event: CustomEvent) => {
  if (event.detail?.type) {
    chrome.runtime.sendMessage(event.detail);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  if (REGX_ZOOM_MEETING.test(location.href)) {
    document.body.style.display = 'none';

    const res = await chrome.runtime.sendMessage({ type: RTMessages.CaptureDesktop });

    if (res === StatusCode.Ok) {
      // when user enabled capturing with check of system audio, permit to start the meeting
      document.body.style.display = 'block';
    } else {
      // disable websocket to prevent attending meeting without permission
      window.dispatchEvent(new CustomEvent(CustomEvents.WsDisable));

      alert(res);
      location.reload();
    }
  }
});


chrome.runtime.onMessage.addListener(async ({ type, data }) => {
  if (type === RTMessages.SetMediaStreamId) {
    const recorder = await recordTab(data.streamId, () => {
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
  }
});
