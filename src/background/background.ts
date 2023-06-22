import { RTMessages } from '@/utils/enums/RTMessages';
import setupProxy from './proxy';
import webSocket from './websocket';
import { getStorageItems, setStorageItems } from '@/utils/helpers/storage';
import { StorageItems } from '@/utils/enums/StorageItems';
import { WsEvents } from '@/utils/enums/WebSocketEvents';

const handleAuthRequired = async (_, callbackFn) => {
  const { proxyUsername, proxyPassword } = await getStorageItems([StorageItems.ProxyUsername, StorageItems.ProxyPassword]);

  callbackFn({
    authCredentials: {
      username: proxyUsername || '',
      password: proxyPassword || ''
    }
  });
};

chrome.runtime.onInstalled.addListener(async () => {
  setupProxy();
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await new Promise<chrome.tabs.Tab>((resolve) => chrome.tabs.get(activeInfo.tabId, (tab) => resolve(tab)));

  if (tab.url.includes('zoom.us/')) {
    setupProxy();
  } else {
    chrome.proxy.settings.clear({ scope: 'regular' });
  }
});

chrome.webRequest.onAuthRequired.addListener(
  handleAuthRequired,
  { urls: ['<all_urls>'] }, ['asyncBlocking']
);

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
      chrome.webRequest.onAuthRequired.removeListener(handleAuthRequired);
      chrome.webRequest.onAuthRequired.addListener(
        handleAuthRequired,
        { urls: ['<all_urls>'] }, ['asyncBlocking']
      );
      break;
    }

    default: {
      break;
    }
    }

    return Promise.resolve();
  }
);
