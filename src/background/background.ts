import { RTMessages } from "@/utils/enums/RTMessages";
import './request';

chrome.runtime.onMessage.addListener((message) => {
  switch(message.type) {
    case RTMessages.ZoomNewMessage:
      console.log('New Message', message.data);
      break;
    case RTMessages.ZoomSendFile:
      console.log('File Transfer', message.data);
      break;
  }
});
