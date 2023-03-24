import { Messages } from "@/utils/constants/enums";

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === Messages.NEW_MESSAGE) {
    console.log(message.data)
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'logo.png',
      title: 'New Message',
      message: message.data.message,
      priority: 2
    });
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});
