import ZoomRTMessages from "@/utils/enums/ZoomRTMessages";

chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
  if (message.type === ZoomRTMessages.NewMessage) {
    console.log(message.data)
  }
});

chrome.action.onClicked.addListener(async (currentTab) => {
  chrome.tabs.create(
    {
      pinned: true,
      active: false, // <--- Important
      url: `chrome-extension://${chrome.runtime.id}/options.html`,
    },
    (tab) => {
      console.log(tab);
    }
  );
});
