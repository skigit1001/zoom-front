import { ZoomRTMessages } from "@/utils/enums/ZoomRTMessages";
import { ZoomChatMessage } from "@/utils/interfaces/zoom/ZoomChatMessage";

const observer = new MutationObserver(mutations => {
  for (let mutation of mutations) {
    for (let addedNode of mutation.addedNodes) {
      const data = traverseNode(addedNode);
      if (data.message) {
        chrome.runtime.sendMessage({
          type: ZoomRTMessages.NewMessage,
          data: data
        });
      }
    }
  }
});

function traverseNode(node: Node, data?: ZoomChatMessage) {
  let updated = { ...data };
  const element = node as HTMLElement;
  const classes = Array.from(element.classList ?? []);
  if (classes.includes('new-chat-message__container')) {
    updated.order = Number(element.id.split('chat-message-content-')[1]);
  } else if (classes.includes('new-chat-message__text-box')) {
    updated.message = element.textContent;
    updated.id = element.id;
  } else if (classes.includes('chat-item__sender')) {
    updated.sender = element.textContent;
  } else if (classes.includes('chat-item__receiver')) {
    updated.receiver = element.textContent;
  } else if (classes.includes('chat-privately')) {
    updated.private = true;
  }
  node.childNodes.forEach(child => {
    updated = {
      ...traverseNode(child, updated)
    };
  });
  return updated;
};

observer.observe(document, { childList: true, subtree: true });
