import { RTMessages } from "@/utils/enums/RTMessages";
import webSocket from './websocket';

let recordingTabId;

chrome.runtime.onMessage.addListener(async ({ type, data }) => {
  switch (type) {
    case RTMessages.ZoomNewMessage:
      console.log('New Message', data);
      break;
    case RTMessages.ZoomSendFile:
      console.log('File Transfer', data);
      break;
    case RTMessages.SetMediaStreamId:
      (chrome as any).declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['ruleset_zoom']
      });
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
        recordingTabId = tab.id;
        chrome.tabs.sendMessage(tab.id, {
          type: RTMessages.SetMediaStreamId,
          data: { streamId: data.streamId }
        });
      });
      break;
    case RTMessages.StopRecording:
      chrome.tabs.sendMessage(recordingTabId, {
        type: RTMessages.StopRecording
      });
      break;
    case RTMessages.SendVideoChunk:
      webSocket.send(data);
      break;
  }
});
