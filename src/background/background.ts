import ZoomRTMessages from "@/utils/enums/ZoomRTMessages";
import './capture';

chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
  if (message.type === ZoomRTMessages.NewMessage) {
    console.log(message.data)
  }
});
