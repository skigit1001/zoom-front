import { RTMessages } from "@/utils/enums/RTMessages";
import webSocket from './websocket';

let recordingTabId;

chrome.runtime.onMessage.addListener(async ({ type, data }, _sender, sendResponse) => {
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

    case RTMessages.StartRecording:
      webSocket.send("start_recording");
      const awaiterAccept = (event) => {
        if (event.data === 'accepted_recording') {
          sendResponse();
          webSocket.removeEventListener('message', awaiterAccept);
        }
      }
      webSocket.addEventListener('message', awaiterAccept);
      break;

    case RTMessages.StopRecording:
      webSocket.send("stop_recording");
      chrome.tabs.sendMessage(recordingTabId, {
        type: RTMessages.StopRecording
      });
      break;

    case RTMessages.SendVideoChunk:
      webSocket.send(data);
      break;
  }
});
