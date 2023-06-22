import { RTMessages } from '@/utils/enums/RTMessages';
import setupProxy from './proxy';
import webSocket from './websocket';
import { getStorageItems, setStorageItems } from '@/utils/helpers/storage';
import { StorageItems } from '@/utils/enums/StorageItems';
import { WsEvents } from '@/utils/enums/WebSocketEvents';
import { URL_CHECKLIST } from '@/config';


chrome.runtime.onInstalled.addListener(async () => {
  setupProxy();
});

/**
 * Check whether current activated tab should pass through proxy whenever selecting tabs
 * 
 * @param activeInfo tabId and windowId of activated tab 
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await new Promise<chrome.tabs.Tab>((resolve) => chrome.tabs.get(activeInfo.tabId, (tab) => resolve(tab)));

  if (URL_CHECKLIST.some(pattern => new RegExp(pattern).test(tab.url))) {
    // Set proxy if current tab url is in checklist
    setupProxy();
  } else {
    // Otherwise, clear proxy
    chrome.proxy.settings.clear({ scope: 'regular' });
  }
});

/**
 * Set basic HTTP credentials of username and password instead of inputting by chrome <sign in> prompt
 */
const handleAuthRequired = async (_, callbackFn) => {
  const { proxyUsername, proxyPassword } = await getStorageItems([StorageItems.ProxyUsername, StorageItems.ProxyPassword]);

  callbackFn({
    authCredentials: {
      username: proxyUsername || '',
      password: proxyPassword || ''
    }
  });
};
chrome.webRequest.onAuthRequired.addListener(
  handleAuthRequired,
  { urls: URL_CHECKLIST }, ['asyncBlocking']
);

/**
 * Service worker message handler
 */
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
        { urls: URL_CHECKLIST }, ['asyncBlocking']
      );
      break;
    }

    default: {
      break;
    }
    }
  }
);
