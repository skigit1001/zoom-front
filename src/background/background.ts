import { RTMessages } from '@/utils/enums/RTMessages';
import setupProxy from './proxy';
import webSocket from './websocket';
import { getStorageItems, setStorageItems } from '@/utils/helpers/storage';
import { StorageItems } from '@/utils/enums/StorageItems';
import { WsEvents } from '@/utils/enums/WebSocketEvents';


chrome.runtime.onInstalled.addListener(() => {
  setupProxy();
});

chrome.windows.onCreated.addListener(() => {
  setupProxy();
});

chrome.runtime.onMessage.addListener(
  async ({ type, data }, _sender, sendResponse) => {
    switch (type) {
    case RTMessages.ZoomNewMessage: {
      console.log('New Message', data);
      break;
    }

    case RTMessages.ZoomSendFile: {
      console.log('File Transfer', data);
      break;
    }

    case RTMessages.SetMediaStreamId: {
      await setStorageItems({ [StorageItems.RecordingTabId]: data.consumerTabId });
      chrome.tabs.sendMessage(data.consumerTabId, {
        type: RTMessages.SetMediaStreamId,
        data: { streamId: data.streamId },
      });
      break;
    }

    case RTMessages.StartRecording: {
      webSocket.send(WsEvents.StartRecording);
      const awaiterAccept = (event) => {
        if (event.data === WsEvents.StopRecording) {
          sendResponse();
          webSocket.removeEventListener('message', awaiterAccept);
        }
      };
      webSocket.addEventListener('message', awaiterAccept);
      break;
    }

    case RTMessages.StopRecording: {
      const { recordingTabId } = await getStorageItems([StorageItems.RecordingTabId]);

      if (recordingTabId > 0) {
        webSocket.send(WsEvents.StopRecording);
        chrome.tabs.sendMessage(recordingTabId, {
          type: RTMessages.StopRecording,
        });
      }
      break;
    }

    case RTMessages.SendVideoChunk: {
      webSocket.send(data);
      break;
    }

    case RTMessages.SetProxy: {
      setupProxy();
      break;
    }

    default: {
      break;
    }
    }
  }
);
