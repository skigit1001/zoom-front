export enum RTMessages {
  // WebSocket
  WebSocketOpen,
  WebSocketClose,
  WebSocketMessage,
  WebSocketSend,
  WebSocketError,

  // MediaRecording
  SetMediaStreamId,
  StartRecording,
  StopRecording,
  SendVideoChunk,
  
  // Zoom
  ZoomNewMessage,
  ZoomSendFile,
};
