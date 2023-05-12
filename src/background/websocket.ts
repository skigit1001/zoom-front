// Create a WebSocket object
const socket = new WebSocket('ws://localhost:9119/api/ws');

// Handle WebSocket connection open event
socket.addEventListener('open', function (event) {
  console.log('WebSocket connection established!');

  // Send a message to the WebSocket server
  socket.send('Hello, server!');
});

// Handle WebSocket connection error event
socket.addEventListener('error', function (event) {
  console.error('WebSocket error:', event);
});

// Handle WebSocket connection close event
socket.addEventListener('close', function (event) {
  console.log('WebSocket connection closed:', event);
});

// Handle incoming WebSocket messages
socket.addEventListener('message', function (event) {
  console.log('Incoming WebSocket message:', event.data);
});

export function sendMessage(msg) {
  socket.send(msg)
};

export default socket;
