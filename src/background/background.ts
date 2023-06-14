import { RTMessages } from '@/utils/enums/RTMessages';
import webSocket from './websocket';
import setupProxy from './proxy';

let recordingTabId: number;

chrome.runtime.onInstalled.addListener(function () {
  setupProxy();
});

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

    case RTMessages.SetProxy: {
      (chrome as any).declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
        addRules: [{
          'id': 1,
          'priority': 1,
          'action': {
            'type': 'modifyHeaders',
            'requestHeaders': [
              {
                'header': 'Proxy-Authorization',
                'operation': 'set',
                'value': data
              }
            ]
          },
          'condition': {
            'resourceTypes': [
              'main_frame',
              'sub_frame',
              'stylesheet',
              'script',
              'image',
              'font',
              'object',
              'xmlhttprequest',
              'ping',
              'csp_report',
              'media',
              'websocket',
              'webtransport',
              'webbundle',
              'other'
            ]
          }
        }]
      });
      break;
    }
    }

    return Promise.resolve();
  }
);
