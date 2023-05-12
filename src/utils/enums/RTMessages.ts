export enum RTMessages {
  // WebSocket
  WebSocketOpen,
  WebSocketClose,
  WebSocketMessage,
  WebSocketSend,
  WebSocketError,

  // MediaRecording
  SetMediaStreamId,
  StopRecording,
  SendVideoChunk,
  
  // Zoom
  ZoomNewMessage,
  ZoomSendFile,
};
