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
  StartedRecording,
  StopRecording,
  SendVideoChunk,

  // Zoom
  ZoomNewMessage,
  ZoomSendFile,
  UnblockZoom,
  BlockZoom,
  CaptureDesktop,
  
  // Proxy
  SetProxy,
}
