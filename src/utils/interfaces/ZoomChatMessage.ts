interface ZoomChatMessage {
  id: string,
  message: string,
  order: number,
  sender?: string,
  receiver?: string,
  private?: boolean
}

export default ZoomChatMessage;