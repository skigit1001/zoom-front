import { ZoomRTMessages } from "@/utils/enums/zoom";
import './capture';
import './request';

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === ZoomRTMessages.NewMessage) {
    console.log(message.data)
  }
});
