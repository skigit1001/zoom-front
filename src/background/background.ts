import { RTMessages } from '@/utils/enums/RTMessages';
import webSocket from './websocket';

let recordingTabId: number;

const config = {
  mode: 'fixed_servers',
  rules: {
    proxyForHttps: {
      scheme: 'http',
      host: 'localhost',
      port: 8080
    },
    bypassList: []
  }
};

chrome.proxy.settings.set(
  {value: config, scope: 'regular'},
  function() {
    console.log('Setup proxy successfully!');
  }
);

chrome.runtime.onMessage.addListener(
  async ({ type, data }, _sender, sendResponse) => {
    switch (type) {
    case RTMessages.ZoomNewMessage:
      console.log('New Message', data);
      break;

    case RTMessages.ZoomSendFile:
      console.log('File Transfer', data);
      break;

    case RTMessages.SetMediaStreamId:
      recordingTabId = data.consumerTabId;
      chrome.tabs.sendMessage(data.consumerTabId, {
        type: RTMessages.SetMediaStreamId,
        data: { streamId: data.streamId },
      });
      break;

    case RTMessages.StartRecording: {
      webSocket.send('start_recording');
      const awaiterAccept = event => {
        if (event.data === 'accepted_recording') {
          sendResponse();
          webSocket.removeEventListener('message', awaiterAccept);
        }
      };
      webSocket.addEventListener('message', awaiterAccept);
      break;
    }

    case RTMessages.StopRecording:
      if (recordingTabId > 0) {
        webSocket.send('stop_recording');
        chrome.tabs.sendMessage(recordingTabId, {
          type: RTMessages.StopRecording,
        });
      }
      break;

    case RTMessages.SendVideoChunk:
      webSocket.send(data);
      break;
    }

    return Promise.resolve();
  }
);
