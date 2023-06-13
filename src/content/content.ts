import { CustomEvents } from '@/utils/enums/CustomEvents';
import { RTMessages } from '@/utils/enums/RTMessages';
import { emitNativeCustomEvent } from '@/utils/helpers/event';
import { observeDomMutations } from './observer';

observeDomMutations();

window.addEventListener(CustomEvents.WebSocketSniffer, (event: CustomEvent) => {
  if (event.detail?.type) {
    chrome.runtime.sendMessage(event.detail);
  }
});

window.addEventListener(CustomEvents.MediaRecorder, (event: CustomEvent) => {
  if (event.detail?.type && !event.detail.isolated) {
    chrome.runtime.sendMessage(event.detail, () => {
      if (event.detail?.type === RTMessages.StartRecording) {
        emitNativeCustomEvent(CustomEvents.MediaRecorder, { type: RTMessages.StartedRecording });
      }
    });
  }
});

chrome.runtime.onMessage.addListener(({ type, data }) => {
  switch (type) {
  case RTMessages.SetMediaStreamId:
  case RTMessages.StopRecording: {
    emitNativeCustomEvent(CustomEvents.MediaRecorder, { type, data, isolated: true });
    break;
  }
  }
});
