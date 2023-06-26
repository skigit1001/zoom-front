import { DNR_RULESET_ZOOM } from '@/utils/constants/dnr';
import { RTMessages } from '@/utils/enums/RTMessages';
import { StatusCode } from '@/utils/enums/StatusCodes';
import { StorageItems } from '@/utils/enums/StorageItems';
import { WsEvents } from '@/utils/enums/WebSocketEvents';
import { getStorageItems, setStorageItems } from '@/utils/helpers/storage';
import setupProxy from './proxy';
import webSocket from './websocket';

chrome.runtime.onInstalled.addListener(() => {
  setupProxy();
});

chrome.windows.onCreated.addListener(() => {
  setupProxy();
});

const stopRecording = async () => {
  webSocket.send(WsEvents.StopRecording);
  await setStorageItems({ [StorageItems.RecordingTabId]: 0 });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.declarativeNetRequest.getEnabledRulesets().then(rulesets => {
      if (rulesets.includes(DNR_RULESET_ZOOM)) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: [DNR_RULESET_ZOOM]
        });
        chrome.tabs.reload(tabId);
      }
    });
  }

  getStorageItems([StorageItems.RecordingTabId]).then(({ recordingTabId }) => {
    if (recordingTabId === tabId) {
      stopRecording();
    }
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  getStorageItems([StorageItems.RecordingTabId]).then(({ recordingTabId }) => {
    if (recordingTabId === tabId) {
      stopRecording();
    }
  });
});

chrome.runtime.onMessage.addListener(
  ({ type, data }, sender, sendResponse) => {
    (async () => {
      switch (type) {
      case RTMessages.ZoomNewMessage: {
        console.log('New Message', data);
        break;
      }

      case RTMessages.ZoomSendFile: {
        console.log('File Transfer', data);
        break;
      }

      case RTMessages.CaptureDesktop: {
        try {
          const streamId = await new Promise((resolve, reject) => chrome.desktopCapture.chooseDesktopMedia(['screen', 'audio'], sender.tab, (streamId, options) => {
            if (options.canRequestAudioTrack) {
              resolve(streamId);
            } else {
              reject('Please share your screen and system audio.');
            }
          }));

          sendResponse(StatusCode.Ok);

          await setStorageItems({ [StorageItems.RecordingTabId]: sender.tab.id });
          chrome.tabs.sendMessage(sender.tab.id, {
            type: RTMessages.SetMediaStreamId,
            data: { streamId: streamId },
          });
        } catch (err) {
          sendResponse(err);
        }
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

      case RTMessages.BlockZoom: {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: [DNR_RULESET_ZOOM]
        });
        sendResponse(StatusCode.Ok);
        break;
      }

      case RTMessages.StartRecording: {
        webSocket.send(WsEvents.StartRecording);
        const awaiterAccept = async (event) => {
          if (event.data === WsEvents.AcceptedRecording) {
            // unblock the meeting by disabling block request ruleset
            await chrome.declarativeNetRequest.updateEnabledRulesets({
              disableRulesetIds: [DNR_RULESET_ZOOM]
            });
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
          await stopRecording();
          await chrome.tabs.remove(recordingTabId);
        }
        break;
      }

      case RTMessages.SendVideoChunk: {
        webSocket.send(data);
        break;
      }

      default:
        sendResponse(StatusCode.Unknown);
        break;
      }
    })();

    return true;
  }
);
